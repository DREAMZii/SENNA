import * as d3 from 'd3';
import {News} from '../news.entity';
import {BubbleUtil} from '../../util/bubble.util';
import {CacheUtil} from '../../util/cache.util';
import {NewsGroup} from '../newsgroup.entity';
import {ServiceUtil} from '../../util/service.util';
import {BubbleAbstract} from '@app/core/entities/bubble/bubble.abstract';
import {BubbleSegment} from "@app/core/entities/bubble/bubble.segment";

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
  private newsGroup: NewsGroup;
  private zoom: any;

  // Visual
  private angleSpawned = 360;
  private angleShift = 25;
  private angleOffset = 2;

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
        single.score >= BubbleUtil.positiveThreshhold
      ).length;
      this.oldNeutAmount = oldNews.filter((single) =>
        single.score > BubbleUtil.negativeThreshhold && single.score < BubbleUtil.positiveThreshhold
      ).length;
      this.oldNegAmount = oldNews.filter((single) =>
        single.score <= BubbleUtil.negativeThreshhold
      ).length;
    });
  }

  public spawn(positionX?: number, positionY?: number) {
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

    // Draw all segments
    Array.from(this.segments.values()).forEach((sentSegments) => {
      for (const single of sentSegments) {
        single.draw(this);
      }
    });

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

      const fontSize = 14 / (BubbleUtil.scalingFactor ** this.referredNumber);

      const nameText = this.group
        .insert('text', 'path:first-child')
        .classed('name-button', true)
        .attr('font-size', fontSize)
        .style('cursor', 'pointer')
        .text(this.searchTerm);

      const mindWidth = 100 / BubbleUtil.scalingFactor ** this.referredNumber;
      let nameW = nameText.node().getBBox().width;
      if (nameW * 1.5 <= mindWidth) {
        nameW = mindWidth;
      } else {
        nameW *= 1.5;
      }
      const nameH = nameText.node().getBBox().height * 1.5;

      const statisticsButtonWidth = nameW / 2;
      this.group
        .insert('rect', ':first-child')
        .classed('name-button', true)
        .attr('x', this.x - nameW  / 2 - statisticsButtonWidth * 1.5 / 2)
        .attr('y', this.y + this.radius + this.radius / 2)
        .attr('rx', 10 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('ry', 10 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('width', nameW)
        .attr('height', nameH)
        .attr('fill', BubbleUtil.grayColor)
        .style('cursor', 'pointer');

      nameText
        .attr('x',
          (this.x - nameW / 2)
          + (nameW / 2)
          - nameText.node().getBBox().width / 2
          - statisticsButtonWidth * 1.5 / 2
        )
        .attr('y',
          (this.y + this.radius * 1.5) + (nameH / 1.5) + (1.5 / BubbleUtil.scalingFactor ** this.referredNumber)
        );

      this.group
        .insert('rect', ':first-child')
        .classed('stats-button', true)
        .attr('x', this.x - nameW / 2 + statisticsButtonWidth * 1.5)
        .attr('y', this.y + this.radius + this.radius / 2)
        .attr('rx', 10 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('ry', 10 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('width', statisticsButtonWidth)
        .attr('height', nameH)
        .attr('fill', BubbleUtil.grayColor)
        .style('cursor', 'pointer')
        .on('click', () => {
          this.openStatistics(nameW, nameH, statisticsButtonWidth);
        });

      this.group
        .insert('image', 'rect:first-child + *')
        .classed('stats-button', true)
        .attr('xlink:href', 'assets/images/statistics.svg')
        .attr('x', this.x - nameW / 2 + statisticsButtonWidth * 1.5)
        .attr('y', this.y + this.radius + this.radius / 2)
        .attr('width', statisticsButtonWidth)
        .attr('height', nameH)
        .style('cursor', 'pointer')
        .on('click', () => {
          this.openStatistics(nameW, nameH, statisticsButtonWidth);
        });
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
      this.preloadReferences(() => {
        this.referencesLoaded = true;

        if (this.shouldLoad) {
          this.shouldLoad = false;
          this.spawnReferences();
        }
      });
    }
  }

  private openStatistics(nameW, nameH, statisticsButtonWidth) {
    if (BubbleUtil.zoomDisabled && BubbleUtil.getActiveBubble() !== this) {
      return;
    }

    if (this.referencesSpawned && this.references.length <= 0) {
      ServiceUtil.alertService.warning('No references for term ' + this.searchTerm.toUpperCase() + '!');
    }

    let selection = d3.select('#statistics-' + this.id);

    // When not open, create the general things
    let initRectX;
    let initRectY;
    if (selection.node() === null) {
      initRectX = this.x - nameW / 2 - statisticsButtonWidth * 1.5 / 2;
      initRectY = this.y + this.radius + this.radius / 2 + nameH + (nameH * 0.2);

      selection = this.group
        .insert('rect', ':first-child')
        .attr('id', 'statistics-' + this.id)
        .classed('stats', true)
        .attr('rx', 7.5 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('ry', 7.5 / BubbleUtil.scalingFactor ** this.referredNumber)
        .attr('x', initRectX)
        .attr('y', initRectY)
        .attr('width', nameW + statisticsButtonWidth + statisticsButtonWidth / 4)
        .attr('full-height', nameH * 10)
        .attr('height', 0)
        .attr('fill', BubbleUtil.grayColor);
    } else {
      d3.selectAll('text.stats')
        .transition()
        .duration(750)
        .style('opacity', 0)
        .on('end', function () {
          d3.select(this).remove();
        });

      d3.selectAll('rect.stats')
        .transition()
        .duration(750)
        .attr('height', 0)
        .on('end', function () {
          d3.select(this).remove();
        });

      return;
    }

    const estimatedHeight = parseFloat(selection.attr('full-height'));
    const width = nameW + statisticsButtonWidth + statisticsButtonWidth / 4;

    const greenPercent = this.oldPosAmount * 100 / this.oldAmount;
    const greenHeight = nameH * 10 * 0.6 * greenPercent / 100;
    const greenDiff = estimatedHeight - greenHeight - estimatedHeight * 0.1;

    const grayPercent = this.oldNeutAmount * 100 / this.oldAmount;
    const grayHeight = nameH * 10 * 0.6 * grayPercent / 100;
    const grayDiff = estimatedHeight - grayHeight - estimatedHeight * 0.1;

    const redPercent = this.oldNegAmount * 100 / this.oldAmount;
    const redHeight = nameH * 10 * 0.6 * redPercent / 100;
    const redDiff = estimatedHeight - redHeight - estimatedHeight * 0.1;

    BubbleUtil.focusBubble(this, () => {
      if (!this.referencesSpawned) {
        BubbleUtil.zoomDisabled = true;

        if (!this.referencesLoaded) {
          this.startRotating();
        }
      }

      this.spawnReferences();
    }, 1, 750);

    const fontSize = 14 / BubbleUtil.scalingFactor ** this.referredNumber;
    const averageText = this.group
      .insert('text', '#statistics-' + this.id + ' + *')
      .classed('stats', true)
      .attr('x', initRectX)
      .attr('y', initRectY + fontSize * 1.5)
      .attr('font-size', fontSize)
      .attr('font-weight', 'bold')
      .style('opacity', 0)
      .text('Average score')
      .transition()
      .duration(750)
      .style('opacity', 1);

    const amountText = this.group
      .insert('text', '#statistics-' + this.id + ' + *')
      .classed('stats', true)
      .attr('x', initRectX)
      .attr('y', initRectY + fontSize * 2.5)
      .attr('font-size', fontSize / 1.5)
      .style('opacity', 0)
      .text('This month | ' + this.oldAmount + ' News')
      .transition()
      .duration(750)
      .style('opacity', 1);

    averageText
      .attr('x', function() {
        const element = d3.select(this);
        return initRectX
          + (selection.node() as SVGGraphicsElement).getBBox().width / 2
          - (element.node().getBBox().width / 2);
      });

    amountText
      .attr('x', function() {
        const element = d3.select(this);
        return initRectX
          + (selection.node() as SVGGraphicsElement).getBBox().width / 2
          - (element.node().getBBox().width / 2);
      });

    selection.transition()
      .duration(750)
      .attr('height', estimatedHeight)
      .on('end', () => {
        const x = this.x - nameW / 2 - statisticsButtonWidth * 1.5 / 2;
        const y = this.y + this.radius + this.radius / 2 + nameH + (nameH * 0.2);

        this.spawnStatsRect(
          x,
          y,
          1,
          width,
          greenDiff,
          greenHeight,
          estimatedHeight,
          greenPercent,
          BubbleUtil.greenColor
        );

        this.spawnStatsRect(
          x,
          y,
          2,
          width,
          grayDiff,
          grayHeight,
          estimatedHeight,
          grayPercent,
          'lightgray'
        );

        this.spawnStatsRect(
          x,
          y,
          3,
          width,
          redDiff,
          redHeight,
          estimatedHeight,
          redPercent,
          BubbleUtil.redColor
        );
      });
  }

  private spawnStatsRect(x, y, index, width, diff, height, fullHeight, percent, color) {
    const fontSize = 14 / BubbleUtil.scalingFactor ** this.referredNumber;
    const statsWidth = width / 5 * 0.8;

    const rectX = x + width / 5 * index + width / 5 * 0.1;
    const rect = this.group
      .insert('rect', '#statistics-' + this.id + ' + *')
      .attr('id', 'green-stat')
      .classed('stats', true)
      .attr('rx', 7.5 / BubbleUtil.scalingFactor ** this.referredNumber)
      .attr('ry', 7.5 / BubbleUtil.scalingFactor ** this.referredNumber)
      .attr('x', rectX)
      .attr('y', y + diff)
      .attr('width', statsWidth)
      .attr('height', 0)
      .attr('fill', color)
      .transition()
      .duration(500)
      .attr('height', height + 1 / (BubbleUtil.scalingFactor ** this.referredNumber));

    const statText = this.group
      .insert('text', '#green-stat + *')
      .classed('stats', true)
      .attr('x', rectX)
      .attr('y', y + diff - fullHeight * 0.05)
      .attr('font-size', fontSize)
      .style('opacity', 0)
      .text(Math.round(percent) + '%');

    statText
      .attr('x', function() {
        const element = d3.select(this);
        return rectX
          + (rect.node().getBBox().width / 2)
          - (element.node().getBBox().width / 2);
      })
      .transition()
      .duration(750)
      .style('opacity', 1);
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
        if (BubbleUtil.bubblesByName.has(formattedTitle)) {
          this.references.push(BubbleUtil.bubblesByName.get(formattedTitle));
          continue;
        }

        await CacheUtil.getNews(referenceTitle).then((news: News[]) => {
          // We don't want those
          if (news.length <= 0) {
            return;
          }

          const refRadius = this.radius / BubbleUtil.scalingFactor;
          const refBubble = new Bubble(referenceTitle, referenceImageUrl,news, refRadius)
            .setReferrer(this);


          refBubble.searchUrl = referenceSearchUrl;
          this.references.push(refBubble);
        });
      }

      if (callback instanceof Function) {
        callback();
      }
    }).catch(() => {
      this.referencesLoaded = true;
      ServiceUtil.alertService.error('References for ' + this.searchTerm.toUpperCase() + ' could not be loaded!');
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
    const container = this.container;
    const graphContainer = d3.select(container.node().parentElement);

    this.zoom = d3.zoom()
      .touchable(true)
      .scaleExtent([-Infinity, Infinity])
      .on('start', () => {
        d3.select('#canvas')
          .style('cursor', 'move');
      })
      .on('zoom', zoomed)
      .on('end', () => {
        d3.select('#canvas')
          .style('cursor', 'default');
      });

    function zoomed() {
      // Loading
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
    graphContainer.on('dblclick.zoom', null);
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
    this.group.selectAll('circle, .name-button').on('click', () => {
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
        this.radius * (BubbleUtil.scalingFactor * 3.5),
        angle
      );

      bubble.angleSpawned = angle;
      bubble.setMiddlePoint(centerPoint[0], centerPoint[1]);

      bubble.spawn();

      BubbleUtil.connect(this, bubble);
    }

    this.stopRotation();
    BubbleUtil.zoomDisabled = false;
    BubbleUtil.focusBubble(BubbleUtil.getActiveBubble(), null, 1, 0);
  }

  public setReferrer(referrer: Bubble): Bubble {
    this.isReferred = true;
    this.referrer = referrer;
    this.referredNumber = this.isReferred ? referrer.referredNumber + 1 : 0;

    return this;
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

  public getAngleDistance() {
    return 360 / this.segments.size;
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
}
