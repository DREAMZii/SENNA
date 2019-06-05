import * as d3 from 'd3';
import {News, NewsSentiment} from '../news.entity';
import {BubbleUtil} from '../../util/bubble.util';
import {CacheUtil} from '../../util/cache.util';
import {ServiceUtil} from '../../util/service.util';
import {BubbleAbstract} from '@app/core/entities/bubble/bubble.abstract';
import {BubbleManager} from "@app/core/entities/bubble/bubble.manager";
import {Focus} from "@app/core/animations/focus.animation";
import {ZoomConfig} from "@app/core/config/zoom.config";
import {BubbleConfig} from "@app/core/config/bubble.config";

export class Bubble extends BubbleAbstract {
  /**
   * Creates the initial bubble instance to create canvas
   *
   * @param searchTerm  - initial searchTerm this bubble gets initiated with
   * @param imageUrl    - initial imageUrl this bubble will display
   * @param news        - news got from azure cognitive services to display the segments
   */
  public static createInitialBubble(searchTerm: string, imageUrl: string, news: any) {
    const bubble = new Bubble(searchTerm, imageUrl, news);

    bubble.preloadReferences(() => {
      bubble.referencesLoaded = true;

      d3.select('#loading-gear').remove();

      bubble.spawn();
      bubble.spawnReferences();
    });
  }

  // Relevant fields
  private id: number;
  private searchUrl = null;
  private group: any;
  private isSpawned = false;

  // Visual
  private angleSpawned = 360;

  // Referrer
  private referredNumber = 0;
  private isReferred = false;
  private referrer = null;

  // References
  private referencesLoaded = false;
  private shouldLoad = false;
  private referencesSpawned = false;
  private referenceNames = [];
  private referenceImages = [];
  private references = [];

  // Loading
  private rotationInterval: any;

  // Statistics
  private oldAmount: number;
  private oldPosAmount: number;
  private oldNeutAmount: number;
  private oldNegAmount: number;

  /**
   * Constructor for Bubble instance
   *
   * @param searchTerm    - search term that created the bubble
   * @param searchImage   - search image to insert into the bubble
   * @param news          - news that will create bubble
   * @param radius        - radius of the bubble in px
   */
  private constructor(
    searchTerm: string,
    searchImage: string,
    news: any,
    radius = 90
  ) {
    super(searchTerm, searchImage, news, radius);
    this.initOldNews();
  }

  private initOldNews() {
    CacheUtil.getOldNews(this.searchTerm).then((oldNews: News[]) => {
      this.oldAmount = oldNews.length;
      this.oldPosAmount = oldNews.filter((single) =>
        single.score >= News.positiveThreshhold
      ).length;
      this.oldNeutAmount = oldNews.filter((single) =>
        single.score > News.negativeThreshhold && single.score < News.positiveThreshhold
      ).length;
      this.oldNegAmount = oldNews.filter((single) =>
        single.score <= News.negativeThreshhold
      ).length;
    });
  }

  public spawn(positionX?: number, positionY?: number) {
    this.isSpawned = true;

    let query = '.active';
    if (d3.select(query).node() === null) {
      query = '#canvas image:first-of-type';
    }

    this.group = this.container
      .insert('g', query)
      .attr('transform', `translate(${BubbleUtil.offsetX}, ${BubbleUtil.offsetY}) scale(${BubbleUtil.scale})`)
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('opacity', this.isReferred ? 0.5 : 1)
      .classed('bubble', true)
      .classed('active', !this.isReferred)
      .classed('inactive', this.isReferred);

    // Draw all segments
    this.getSegments(NewsSentiment.NEUTRAL).forEach((single) => {
      single.draw();
    });

    this.getSegments(NewsSentiment.NEGATIVE).forEach((single) => {
      single.draw();
    });

    this.getSegments(NewsSentiment.POSITIVE).forEach((single) => {
      single.draw();
    });

    this.id = BubbleManager.getBubbles().length - 1;

    this.drawImage();
    this.drawNameTagAndStatistic();

    // Draw invisible circle for click event
    this.group
      .append('circle')
      .attr('cx', this.x)
      .attr('cy', this.y)
      .attr('fill-opacity', '0')
      .attr('bubble-id', this.id)
      .attr('r', this.radius - this.strokeWidth / 2);

    this.handleEvents();

    if (this.isReferred) {
      this.preloadReferences(() => {
        this.referencesLoaded = true;

        if (this.shouldLoad) {
          this.shouldLoad = false;
          this.spawnReferences();
        }
      });
    }
  }

  private preloadReferences(callback?: Function) {
    const amount = this.isReferred ? 3 : 4;

    // Load references on initialization
    CacheUtil.getReferences(this.searchTerm, amount, this.searchUrl).then( async (references: string[]) => {
      for (const reference of references) {
        const referenceTitle = reference['referenceTitle'];
        const referenceImageUrl = reference['referenceImageUrl'];
        const referenceSearchUrl = reference['referenceUrl'];

        this.referenceNames.push(referenceTitle);
        this.referenceImages.push(referenceImageUrl);

        const formattedTitle = referenceTitle.split(' ').join('-').toLowerCase();
        if (BubbleManager.getBubbleMap().has(formattedTitle)) {
          this.references.push(BubbleManager.getBubbleMap().get(formattedTitle));
          continue;
        }

        await CacheUtil.getNews(referenceTitle).then((news: News[]) => {
          // We don't want those
          if (news.length <= 0) {
            return;
          }

          const refRadius = this.radius / BubbleConfig.SCALING_FACTOR;
          const refBubble = new Bubble(referenceTitle, referenceImageUrl,news, refRadius)
            .setReferrer(this);


          refBubble.searchUrl = referenceSearchUrl;
          this.references.push(refBubble);
        });
      }

      if (callback instanceof Function) {
        callback();
      }
    }).catch((e) => {
      this.referencesLoaded = true;
      ServiceUtil.alertService.error('References for ' + this.searchTerm.toUpperCase() + ' could not be loaded!');

      console.error(e);
    });
  }

  private handleEvents() {
    // Recenter button
    this.group.selectAll('circle, .name-button').on('click', () => {
      if (this.referencesSpawned && this.references.length <= 0) {
        ServiceUtil.alertService.warning('No references for term ' + this.searchTerm.toUpperCase() + '!');
      }

      Focus.focus(this, () => {
        if (!this.referencesSpawned) {
          ZoomConfig.zoomDisabled = true;

          if (!this.referencesLoaded) {
            this.startRotating();
          }
        }

        this.spawnReferences();
      });
    });
  }

  public startRotating() {
    if (!this.isReferred) {
      return;
    }

    let i = 0;
    const timeInterval = 10;

    this.rotationInterval = setInterval(() => {
      i += 1;
      this.group
        .selectAll('path')
        .attr('transform', `rotate(${i}, ${this.x}, ${this.y})`);
    }, timeInterval);
  }

  private stopRotation() {
    if (!this.isReferred) {
      return;
    }

    clearInterval(this.rotationInterval);

    this.group
      .selectAll('path')
      .attr('transform', null);
  }

  public spawnReferences() {
    // Already queued or even spawned
    if (this.referencesSpawned) {
      return;
    }

    if (!this.referencesLoaded || this.shouldLoad) {
      this.shouldLoad = true;
      return;
    }

    if (this.references.length <= 0) {
      this.referencesSpawned = true;
      ServiceUtil.alertService.warning('No references for term ' + this.searchTerm.toUpperCase() + '!');

      this.stopRotation();
      ZoomConfig.zoomDisabled = false;
      Focus.focus(BubbleManager.getActiveBubble(), null, 1, 0);
      return;
    }

    // Spawn references
    this.referencesSpawned = true;

    const spawnableBubbles = [];
    const alreadyExisting = [];

    for (const bubble of this.references) {
      if (bubble.isSpawned) {
        alreadyExisting.push(bubble);
      } else {
        spawnableBubbles.push(bubble);
      }
    }

    for (const bubble of alreadyExisting) {
      BubbleUtil.connect(this, bubble);
    }

    for (let i = 0; i < spawnableBubbles.length; i++) {
      const bubble = spawnableBubbles[i];
      const referencesCount = spawnableBubbles.length;
      let initialAngle = this.angleSpawned;
      let angle = 0;
      if (this.isReferred) {
        const range = 90;
        const min = initialAngle - 90 + 45;

        if (referencesCount === 1) {
          angle = min + (range / 2);
        } else {
          angle = min + (i * range / (referencesCount - 1));
        }

        console.log('Min: ' + min + ', Angle: ' + angle);
      } else {
        let angleOffset = 0;
        if (spawnableBubbles.length === 4) {
          angleOffset = 45;
        }

        angle = i * initialAngle / referencesCount + angleOffset;
      }

      const centerPoint = BubbleUtil.getPointOnCircle(
        this.x,
        this.y,
        this.radius * (BubbleConfig.SCALING_FACTOR * 3.5),
        angle
      );

      bubble.angleSpawned = angle;
      bubble.setMiddlePoint(centerPoint[0], centerPoint[1]);

      bubble.spawn();

      BubbleUtil.connect(this, bubble);
    }

    this.stopRotation();
    ZoomConfig.zoomDisabled = false;
    Focus.focus(BubbleManager.getActiveBubble(), null, 1, 0);
  }

  public setReferrer(referrer: Bubble): Bubble {
    this.isReferred = true;
    this.referrer = referrer;
    this.referredNumber = this.isReferred ? referrer.referredNumber + 1 : 0;

    return this;
  }

  public getId() {
    return this.id;
  }

  public getSearchTerm() {
    return this.searchTerm;
  }

  public getSearchImage() {
    return this.searchImage;
  }

  public getContainer() {
    return this.container;
  }

  public getGroup() {
    return this.group;
  }

  public getZoom() {
    return this.zoom;
  }

  public getNewsGroup() {
    return this.newsGroup;
  }

  public getNews(newsId: number) {
    return this.newsGroup.getNews()[newsId];
  }

  public getReferrer() {
    return this.referrer;
  }

  public getReferredNumber() {
    return this.referredNumber;
  }

  public getAngleDistance() {
    const count = this.getSegmentCount(NewsSentiment.POSITIVE)
        + this.getSegmentCount(NewsSentiment.NEUTRAL)
        + this.getSegmentCount(NewsSentiment.NEGATIVE);

    return 360 / count;
  }

  public getStrokeWidth() {
    return this.strokeWidth;
  }

  public getRadius() {
    return this.radius;
  }

  public getCenterX() {
    return this.x;
  }

  public getCenterY() {
    return this.y;
  }

  public isReferencesSpawned() {
    return this.referencesSpawned;
  }

  public isReferencesLoaded() {
    return this.referencesLoaded;
  }

  public getReferences() {
    return this.references;
  }

  public getOldNewsAmount() {
    return this.oldAmount;
  }

  public getOldPosAmount() {
    return this.oldPosAmount;
  }

  public getOldNeutAmount() {
    return this.oldNeutAmount;
  }

  public getOldNegAmount() {
    return this.oldNegAmount;
  }
}
