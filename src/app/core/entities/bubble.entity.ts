import * as d3 from 'd3';
import {News} from '@app/core/entities/news.entity';
import {BubbleUtil} from "@app/core/util/bubble.util";

export class Bubble {
  // All the bubbles
  private static bubbles = [];

  // Relevant fields
  private readonly container: any;
  private group: any;
  private greenSegments: number;
  private graySegments: number;
  private redSegments: number;
  private readonly radius: number;
  private x: number;
  private y: number;
  private news: News[];
  private readonly strokeWidth: number;
  private zoom: any;

  // Visual
  private angleShift = 25;
  private angleOffset = 2;

  private readonly referredNumber: number;
  private readonly isReferred: boolean;
  private referrer: Bubble;

  /**
   * Constructor for Bubble instance
   *
   * @param news          - news that will create bubble
   * @param isReferred    - whether this bubble is spawned by referring
   * @param referrer      - referrer bubble
   * @param radius        - radius of bubble
   * @param container     - container where the svg should be located
   */
  constructor(news, isReferred = false, referrer = null, radius = 75, container = '#graphContainer') {
    this.applyNews(news);
    this.isReferred = isReferred;
    this.referrer = referrer;
    this.referredNumber = this.isReferred ? referrer.referredNumber + 1 : 0;
    this.container = d3.select(container).select('svg');
    this.radius = radius;
    this.strokeWidth = radius / 5;
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
    Bubble.bubbles.push(this);

    this.group = this.container
      .append('g')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('z-index', 10)
      .classed('bubble', true);

    this.draw(this.redSegments, BubbleUtil.redColor, positionX, positionY)
      .draw(this.graySegments, BubbleUtil.grayColor, positionX, positionY)
      .draw(this.greenSegments, BubbleUtil.greenColor, positionX, positionY);

    // Draw invisible circle for click event
    this.group
      .append('circle')
      .attr('cx', this.x)
      .attr('cy', this.y)
      .attr('fill-opacity', '0')
      .attr('bubble-id', `${Bubble.bubbles.length - 1}`)
      .attr('r', this.radius - this.strokeWidth / 2);

    this.handleZoom();
    this.handleEvents();
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

    // Recenter button
    this.group.selectAll('circle').on('click', () => {
      BubbleUtil.zoomToBubble(this.zoom, this.container, this.x, this.y, this.referredNumber + 1);
    });
  }

  private handleEvents() {
    const news = this.news;
    const radius = this.radius;
    const angleDistance = this.getAngleDistance();

    const centerX = this.x;
    const centerY = this.y;

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
      const angle = newsId * angleDistance;
      const angleInRadians = (angle + this.angleShift - 90) * Math.PI / 180.0;

      const x = centerX + radius * Math.cos(angleInRadians);
      const y = centerY + radius * Math.sin(angleInRadians);

      news[newsId].draw(this.container, this.group, x, y, 200, 300, newsId, 2 ** this.referredNumber);

      BubbleUtil.zoomToBubble(this.zoom, this.container, this.x, this.y, this.referredNumber + 1);
    });
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
