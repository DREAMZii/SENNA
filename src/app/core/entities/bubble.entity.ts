import * as d3 from 'd3';
import {News} from '@app/core/entities/news.entity';
import {BubbleUtil} from "@app/core/util/bubble.util";
import {CacheUtil} from "@app/core/util/cache.util";

export class Bubble {
  // Relevant fields
  private id: number;
  private readonly searchTerm: any;
  private readonly container: any;
  private group: any;
  private greenSegments: number;
  private graySegments: number;
  private redSegments: number;
  public radius: number;
  private x: number;
  private y: number;
  private news: News[];
  public strokeWidth: number;
  private zoom: any;

  // Visual
  private angleShift = 25;
  private angleOffset = 2;

  // Referrer
  private readonly referredNumber: number;
  private readonly isReferred: boolean;
  private readonly referrer: Bubble;

  // References
  private referencesLoaded = false;
  private shouldLoad = false;
  private referencesSpawned = false;
  private referenceNames = [];
  private references = [];

  /**
   * Constructor for Bubble instance
   *
   * @param searchTerm    - search term that created the bubble
   * @param news          - news that will create bubble
   * @param isReferred    - whether this bubble is spawned by referring
   * @param referrer      - referrer bubble
   * @param radius        - radius of bubble
   * @param container     - container where the svg should be located
   */
  constructor(searchTerm, news, isReferred = false, referrer = null, radius = BubbleUtil.radius, container = '#graphContainer') {
    this.searchTerm = searchTerm;
    this.isReferred = isReferred;
    this.referrer = referrer;
    this.referredNumber = this.isReferred ? referrer.referredNumber + 1 : 0;
    this.container = d3.select(container).select('svg');
    this.radius = radius;
    this.strokeWidth = radius / 5;

    this.applyNews(news);
  }

  private applyNews(news) {
    this.news = news;

    // Sort news (best one first)
    this.news.sort((a, b) => {
      return a.sentiment > b.sentiment ? 1 : -1;
    });

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

    this.group = this.container
      .append('g')
      .attr('width', '100%')
      .attr('height', '100%')
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

    // Draw invisible circle for click event
    this.group
      .append('circle')
      .attr('cx', this.x)
      .attr('cy', this.y)
      .attr('fill-opacity', '0')
      .attr('bubble-id', this.id)
      .attr('r', this.radius - this.strokeWidth / 2);

    for (const article of this.news) {
      const newsId = this.group.selectAll('.news').size();
      const angle = newsId * this.getAngleDistance() + this.angleShift;
      const point = BubbleUtil.getPointOnCircle(this.x, this.y, this.radius, angle);

      article.draw(this.container, this.group, point[0], point[1], 200, 300, newsId, BubbleUtil.scalingFactor ** this.referredNumber);
    }

    this.handleZoom();
    this.handleEvents();

    this.preloadReferences();
  }

  private preloadReferences() {
    // Load references on initialization
    CacheUtil.getReferences(this.searchTerm).then( (referenceNames: string[]) => {
       this.referenceNames = referenceNames;

      for (let referenceName of referenceNames) {
        CacheUtil.getNews(referenceName).then((news: News[]) => {
          // We don't want those
          if (news.length <= 0) {
            return;
          }

          this.references.push(new Bubble(this.searchTerm, news, true, this, this.radius / BubbleUtil.scalingFactor));
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
      .scaleExtent([1 / 4, 6])
      .on('zoom', zoomed);

    function zoomed() {
      container.selectAll('g')
        .filter(function() {
          return d3.select(this).classed('bubble') || d3.select(this).classed('line');
        })
        .attr('transform', d3.event.transform);

      BubbleUtil.scale = d3.event.transform.k;
      BubbleUtil.offsetX = d3.event.transform.x;
      BubbleUtil.offsetY = d3.event.transform.y;
    }

    graphContainer.call(this.zoom);
  }

  private handleEvents() {
    const news = this.news;
    const strokeWidth = this.strokeWidth;

    // Path events for news
    this.group.selectAll('path').on('mouseover', function() {
      d3.select(this).transition()
        .attr('stroke-width', strokeWidth * 2)
        .style('cursor', 'pointer');
    }).on('mouseout', function() {
      d3.select(this).transition()
        .attr('stroke-width', strokeWidth)
        .style('cursor', 'default');
    }).on('click', () =>  {
      const newsId = parseInt(d3.select(d3.event.srcElement).attr('news-id'), 10);
      news[newsId].show(this.container, this.group, newsId);

      BubbleUtil.focusBubble(this);
    });

    // Recenter button
    this.group.selectAll('circle').on('click', () => {
      //this.spawnReferences();
      BubbleUtil.focusBubble(this, () => {
        this.spawnReferences();
      });
    });
  }

  private spawnReferences() {
    // Already queued or even spawned
    if (this.referencesSpawned) {
      return;
    }

    // Spawn references
    this.referencesSpawned = true;
    for (let i = 0; i < this.references.length; i++) {
      const referencesCount = this.references.length;
      let angle = i * 360 / referencesCount;
      // Add some fake dynamic
      angle += 360 / referencesCount / 2 * (this.referredNumber % referencesCount);

      if (this.referrer !== null && referencesCount % 2 !== 0) {
        angle += 360 / referencesCount / 2 * (this.referredNumber % referencesCount);
      }

      const centerPoint = BubbleUtil.getPointOnCircle(
        this.x,
        this.y,
        this.radius * (BubbleUtil.scalingFactor * 2),
        angle
      );
      const bubble = this.references[i];
      bubble.spawn(centerPoint[0], centerPoint[1]);

      BubbleUtil.connect(this, bubble);
    }
  }

  public getReferredNumber() {
    return this.referredNumber;
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