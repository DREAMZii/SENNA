import * as d3 from 'd3';
import {News} from '@app/core/entities/news.entity';
import {BubbleUtil} from '@app/core/util/bubble.util';
import {CacheUtil} from '@app/core/util/cache.util';
import {NewsGroup} from '@app/core/entities/newsgroup.entity';
import {ServiceUtil} from '@app/core/util/service.util';

export class Bubble {
  // Relevant fields
  private id: number;
  private readonly searchTerm: any;
  private readonly searchImage: any;
  private readonly container: any;
  private group: any;
  private greenSegments: number;
  private graySegments: number;
  private redSegments: number;
  public radius: number;
  private x: number;
  private y: number;
  private newsGroup: NewsGroup;
  private oldNews: News[];
  public strokeWidth: number;
  private zoom: any;

  // Visual
  private angleSpawned = 360;
  private angleShift = 25;
  private angleOffset = 2;

  // Referrer
  private readonly referredNumber: number;
  private readonly isReferred: boolean;
  private readonly referrer: Bubble;

  // References
  private referencesLoaded = false;
  public shouldLoad = false;
  private referencesSpawned = false;
  private referenceNames = [];
  private referenceImages = [];
  private references = [];

  // Loading
  private rotationInterval: any;

  /**
   * Constructor for Bubble instance
   *
   * @param searchTerm    - search term that created the bubble
   * @param searchImage   - search image to insert into the bubble
   * @param news          - news that will create bubble
   * @param isReferred    - whether this bubble is spawned by referring
   * @param referrer      - referrer bubble
   * @param radius        - radius of bubble
   * @param container     - container where the svg should be located
   */
  constructor(
    searchTerm,
    searchImage,
    news,
    isReferred = false,
    referrer = null,
    radius = BubbleUtil.radius,
    container = '#graphContainer'
  ) {
    this.searchTerm = searchTerm;
    this.searchImage = searchImage;
    this.isReferred = isReferred;
    this.referrer = referrer;
    this.referredNumber = this.isReferred ? referrer.referredNumber + 1 : 0;
    this.container = d3.select(container).select('#canvas');
    this.radius = radius;
    this.strokeWidth = radius / 5;
    this.applyNews(news);

    ServiceUtil.azureService.searchOldNews(this.searchTerm).then((oldNews) => {
      console.log(oldNews);
    });

    if (!isReferred) {
      this.preloadReferences()
        .then(() => {
          this.referencesLoaded = true;

          d3.select('#loading-gear').remove();

          this.spawn();
          this.spawnReferences();
        })
        .catch(() => {
          ServiceUtil.alertService.error('Initial references could not be loaded!');
        });
    }
  }

  private applyNews(news) {
    // Sort news (best one first)
    news = news.sort((a, b) => {
      return a.sentiment > b.sentiment ? 1 : -1;
    });

    this.newsGroup = new NewsGroup(this, news);

    this.greenSegments = 0;
    this.graySegments = 0;
    this.redSegments = 0;
    for (const single of news) {
      if (single.sentiment >= BubbleUtil.positiveThreshhold) {
        this.greenSegments++;
      } else if (single.sentiment > BubbleUtil.negativeThreshhold && single.sentiment < BubbleUtil.positiveThreshhold) {
        this.graySegments++;
      } else {
        this.redSegments++;
      }
    }
  }

  /**
   * Spawns circle
   *
   * @param positionX - possible starting X coordinate (uses centered x of svg when not given)
   * @param positionY - possible starting Y coordinate (uses centered y of svg when not given)
   */
  public spawn(positionX?, positionY?) {
    BubbleUtil.bubbles.push(this);
    BubbleUtil.bubblesByName.set(this.searchTerm.toLowerCase().split(' ').join('-'), this);

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

    this.draw(this.redSegments, BubbleUtil.redColor, positionX, positionY)
      .draw(this.graySegments, BubbleUtil.grayColor, positionX, positionY)
      .draw(this.greenSegments, BubbleUtil.greenColor, positionX, positionY);

    this.id = BubbleUtil.bubbles.length - 1;

    if (this.searchImage === '') {
      const text = this.group
      .append('text')
      .attr('font-size', 16 / (BubbleUtil.scalingFactor ** this.referredNumber))
      .text(this.searchTerm);

      const width = text.node().getComputedTextLength();
      text
        .attr('x', this.x - width / 2)
        .attr('y', this.y);
    } else {
      const rectWH = this.radius + this.radius / 3.5;

      this.group
        .append('rect')
        .attr('id', 'bubble-rect-' + this.id)
        .attr('x', this.x - rectWH / 2)
        .attr('y', this.y - rectWH / 2)
        .attr('rx', 20 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('ry', 20 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('width', rectWH)
        .attr('height', rectWH)
        .attr('xlink:href', this.searchImage)
        .attr('clip-path', 'url(#clip)');

      this.container
        .select('#clip')
        .append('use')
        .attr('xlink:href', '#bubble-rect-' + this.id);

      this.group
        .append('image')
        .attr('x', this.x - rectWH / 2)
        .attr('y', this.y - rectWH / 2)
        .attr('width', rectWH)
        .attr('height', rectWH)
        .attr('xlink:href', this.searchImage)
        .attr('clip-path', 'url(#clip)');

      const nameW = this.radius + this.radius / 4;

      this.group
        .insert('rect', ':first-child')
        .attr('x', this.x - nameW / 2)
        .attr('y', this.y + this.radius + this.radius / 2)
        .attr('rx', 10 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('ry', 10 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('width', nameW)
        .attr('height', nameW * 0.2)
        .attr('fill', 'lightgray');

      const nameText = this.group
        .insert('text', 'rect:first-child + *')
        .attr('font-size', 14 / (BubbleUtil.scalingFactor ** this.referredNumber))
        .text(this.searchTerm);

      const nameTextWidth = nameText.node().getComputedTextLength();

      nameText
        .attr('x', this.x - nameTextWidth / 2)
        .attr('y',
          (this.y + this.radius + this.radius / 2 + nameW * 0.2) -
          (14 / BubbleUtil.scalingFactor ** this.referredNumber / 2)
        );
    }

    // Draw invisible circle for click event
    this.group
      .append('circle')
      .attr('cx', this.x)
      .attr('cy', this.y)
      .attr('fill-opacity', '0')
      .attr('bubble-id', this.id)
      .attr('r', this.radius - this.strokeWidth / 2);

    this.handleZoom();
    this.handleEvents();

    if (this.isReferred) {
      this.preloadReferences()
        .then(() => {
          this.referencesLoaded = true;

          if (this.shouldLoad) {
            this.shouldLoad = false;
            this.spawnReferences();
          }
        });
    }
  }

  private async preloadReferences() {
    const amount = this.isReferred ? 3 : 4;

    // Load references on initialization
    await CacheUtil.getReferences(this.searchTerm, amount).then( async (references: string[]) => {
      for (const reference of references) {
        const referenceTitle = reference['referenceTitle'];
        const referenceImageUrl = reference['referenceImageUrl'];

        this.referenceNames.push(referenceTitle);
        this.referenceImages.push(referenceImageUrl);

        const formattedTitle = referenceTitle.split(' ').join('-').toLowerCase();
        if (BubbleUtil.bubblesByName.has(formattedTitle)) {
          this.references.push(BubbleUtil.bubblesByName.get(formattedTitle));
          continue;
        }

        await CacheUtil.getNews(referenceTitle).then((news: News[]) => {
          // We don't want those
          if (news.length <= 0) {
            return;
          }

          this.references.push(new Bubble(referenceTitle, referenceImageUrl, news, true, this, this.radius / BubbleUtil.scalingFactor));
        });
      }
    });
  }

  private draw(segments, color, positionX?, positionY?) {
    const startValue = this.group.selectAll('path').size();
    const rect = this.container.node().getBoundingClientRect();

    this.x = positionX ? positionX : rect.width / 2;
    this.y = positionY ? positionY : rect.height / 2;

    const angleDistance = this.getAngleDistance();
    for (let i = startValue; i < startValue + segments; i++) {
      this.group
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', this.strokeWidth)
        .attr('news-id', i)
        .attr('d', () => {
          return BubbleUtil.describeArc(
            this.x,
            this.y,
            this.radius,
            i * angleDistance + this.angleOffset + this.angleShift,
            (i + 1) * angleDistance - this.angleOffset + this.angleShift
          );
        });
    }

    return this;
  }

  private handleZoom() {
    const graphContainer = d3.select('#graphContainer');
    const container = this.container;

    this.zoom = d3.zoom()
      .touchable(true)
      .scaleExtent([-Infinity, Infinity])
      .on('zoom', zoomed);

    function zoomed() {
      if (BubbleUtil.zoomDisabled) {
        return;
      }

      container.selectAll('g')
        .filter(function() {
          return d3.select(this).classed('bubble') || d3.select(this).classed('line');
        })
        .attr('transform', d3.event.transform);
    }

    graphContainer.call(this.zoom);
  }

  private handleEvents() {
    const strokeWidth = this.strokeWidth;

    // Path events for news
    this.group.selectAll('path').on('mouseover', function() {
      if (BubbleUtil.zoomDisabled) {
        return;
      }

      d3.select(this).transition()
        .attr('stroke-width', strokeWidth * 2)
        .style('cursor', 'pointer');
    }).on('mouseout', function() {
      d3.select(this).transition()
        .attr('stroke-width', strokeWidth)
        .style('cursor', 'default');
    }).on('click', () =>  {
      if (BubbleUtil.zoomDisabled) {
        return;
      }

      const clicked = d3.select(d3.event.srcElement);
      this.newsGroup.draw(this.getNews(parseInt(clicked.attr('news-id'), 10)));
      BubbleUtil.focusBubble(this);
    });

    // Recenter button
    this.group.select('circle').on('click', () => {
      if (this.referencesSpawned && this.references.length <= 0) {
        ServiceUtil.alertService.warning('No references for term ' + this.searchTerm.toUpperCase() + '!');
      }

      BubbleUtil.focusBubble(this, () => {
        if (!this.referencesSpawned) {
          BubbleUtil.zoomDisabled = true;

          if (!this.referencesLoaded) {
            this.startRotating();
          }
        }

        this.spawnReferences();
      });
    });
  }

  private startRotating() {
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

  private spawnReferences() {
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
      BubbleUtil.zoomDisabled = false;
      BubbleUtil.focusBubble(BubbleUtil.getActiveBubble(), null, 1, 0);
      return;
    }

    // Spawn references
    this.referencesSpawned = true;

    const spawnableBubbles = this.references.filter(bubble => BubbleUtil.bubbles.indexOf(bubble) < 0);
    const alreadyExisting = this.references.filter(bubble => BubbleUtil.bubbles.indexOf(bubble) >= 0);

    for (const bubble of alreadyExisting) {
      BubbleUtil.connect(this, bubble);
    }

    for (let i = 0; i < spawnableBubbles.length; i++) {
      const bubble = spawnableBubbles[i];

      const referencesCount = spawnableBubbles.length;
      let initialAngle = bubble.angleSpawned;
      let angle = 0;
      if (this.isReferred) {
        initialAngle = bubble.getReferrer().angleSpawned;
        console.log(initialAngle);
        const range = 90;
        const min = initialAngle - 90 + 45;

        if (referencesCount === 1) {
          angle = min + (range / 2);
        } else {
          angle = min + (i * range / (referencesCount - 1));
        }

        console.log('Min: ' + min + ', Angle: ' + angle);
      } else {
        angle = i * initialAngle / referencesCount;
      }

      const centerPoint = BubbleUtil.getPointOnCircle(
        this.x,
        this.y,
        this.radius * (BubbleUtil.scalingFactor * 3.5),
        angle
      );

      bubble.angleSpawned = angle;

      bubble.spawn(centerPoint[0], centerPoint[1]);

      BubbleUtil.connect(this, bubble);
    }

    this.stopRotation();
    BubbleUtil.zoomDisabled = false;
    BubbleUtil.focusBubble(BubbleUtil.getActiveBubble(), null, 1, 0);
  }

  public getId() {
    return this.id;
  }

  public getContainer() {
    return this.container;
  }

  public getGroup() {
    return this.group;
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

  public getStrokeWidth() {
    return this.strokeWidth;
  }

  public getAngleDistance() {
    return 360 / (this.greenSegments + this.graySegments + this.redSegments);
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
}
