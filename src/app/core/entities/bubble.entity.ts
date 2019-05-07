import * as d3 from 'd3';
import {News} from '@app/core/entities/news.entity';

export class Bubble {
  // Standard values
  private static greenColor = '#8CA528';
  private static grayColor = '#E1E1E1';
  private static redColor = '#AE0055';
  private static lineColor = 'black';

  private static positiveThreshhold = 0.55;
  private static negativeThreshhold = 0.4;
  private static offset = 2;

  private static scale = 1;
  private static offsetX = 0;
  private static offsetY = 0;

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

  /**
   * Connect two bubbles
   *
   * @param bubble1 - first bubble
   * @param bubble2 - second bubble
   */
  static connect(bubble1: Bubble, bubble2: Bubble) {
    // Calculate angle between 2 middle points
    const xDiff = bubble2.getCenterX() - bubble1.getCenterX();
    const yDiff = bubble2.getCenterY() - bubble1.getCenterY();
    const angleInRad1 = Math.atan2(yDiff, xDiff);

    const xDiff2 = bubble1.getCenterX() - bubble2.getCenterX();
    const yDiff2 = bubble1.getCenterY() - bubble2.getCenterY();
    const angleInRad2 = Math.atan2(yDiff2, xDiff2);


    // Find point on circle relative to calculated angle
    const x1 = bubble1.getCenterX() + bubble1.getRadius() * Math.cos(angleInRad1);
    const y1 = bubble1.getCenterY() + bubble1.getRadius() * Math.sin(angleInRad1);

    // Find point on circle 2
    const x2 = bubble2.getCenterX() + bubble2.getRadius() * Math.cos(angleInRad2);
    const y2 = bubble2.getCenterY() + bubble2.getRadius() * Math.sin(angleInRad2);

    const group = d3.select('#graphContainer')
      .select('svg')
      .append('g')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('z-index', 0)
      .classed('line', true);

    // Append line with calculated endpoints
    group.append('line')
      .style('stroke', this.lineColor)
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2);
  }

  /**
   * Constructor for Bubble instance
   *
   * @param news          - news that will create bubble
   * @param radius        - radius of bubble
   * @param container     - container where the svg should be located
   */
  constructor(news, radius = 75, container = '#graphContainer') {
    this.applyNews(news);
    this.container = d3.select(container).select('svg');
    this.radius = radius;
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
      if (single.sentiment >= Bubble.positiveThreshhold) {
        this.greenSegments++;
      } else if (single.sentiment > Bubble.negativeThreshhold && single.sentiment < Bubble.positiveThreshhold) {
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
    this.group = this.container
      .append('g')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('z-index', 10)
      .classed('bubble', true);

    this.draw(this.greenSegments, Bubble.greenColor, positionX, positionY)
      .draw(this.graySegments, Bubble.grayColor, positionX, positionY)
      .draw(this.redSegments, Bubble.redColor, positionX, positionY);

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
        .attr('stroke-width', this.radius / 5)
        .attr('news-id', i)
        .attr('d', () => {
          return this.describeArc(
            this.x,
            this.y,
            this.radius,
            i * angleDistance + Bubble.offset,
            (i + 1) * angleDistance - Bubble.offset
          );
        });
    }

    return this;
  }

  private describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }

  private polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  private handleZoom() {
    const graphContainer = d3.select('#graphContainer');
    const container = this.container;

    const zoom = d3.zoom()
      .scaleExtent([1 / 4, 6])
      .on('zoom', zoomed);

    function zoomed() {
      container.selectAll('g')
        .filter(function() {
          return d3.select(this).classed('bubble') || d3.select(this).classed('line');
        })
        .attr('transform', d3.event.transform);

      Bubble.scale = d3.event.transform.k;
      Bubble.offsetX = d3.event.transform.x;
      Bubble.offsetY = d3.event.transform.y;
    }

    graphContainer.call(zoom);

    // Recenter button
    this.container.on('click', function() {
      const rect = container.node().getBoundingClientRect();

      // parenthesis just for readability
      const distX = rect.width / 2 - d3.event.x + Bubble.offsetX;
      const distY = rect.height / 2 - d3.event.y + Bubble.offsetY;

      graphContainer.selectAll('g')
        .filter(function() {
          return d3.select(this).classed('bubble') || d3.select(this).classed('line');
        })
        .transition()
        .duration(750)
        .attr('transform', d3.zoomIdentity
          .translate(
            d3.zoomIdentity.applyX(distX),
            d3.zoomIdentity.applyY(distY)
          ).scale(Bubble.scale).toString())
        .on('end', function() {
          graphContainer.call(zoom.transform, d3.zoomIdentity.translate(distX, distY).scale(Bubble.scale));
        });
    });
  }

  private handleEvents() {
    const group = this.group;
    const news = this.news;
    const radius = this.radius;
    const angleDistance = this.getAngleDistance();

    const centerX = this.x;
    const centerY = this.y;

    // Path events for news
    this.group.selectAll('path').on('mouseover', function() {
      d3.select(this).transition()
        .attr('stroke-width', radius / 5 + 15)
        .style('cursor', 'pointer');
    }).on('mouseout', function() {
      d3.select(this).transition()
        .attr('stroke-width', radius / 5)
        .style('cursor', 'default');
    }).on('click', function() {
      const newsId = parseInt(d3.select(this).attr('news-id'), 16);
      const angle = newsId * angleDistance;
      const angleInRadians = (angle - 90) * Math.PI / 180.0;

      const x = centerX + radius * Math.cos(angleInRadians);
      const y = centerY + radius * Math.sin(angleInRadians);

      group.selectAll('g')
        .transition()
        .style('opacity', '0');

      news[newsId].draw(group, x, y, 200, 300, newsId);
    });
  }

  /**
   * Despawns circle
   */
  public despawn() {
    this.group.remove();

    this.group = null;
    this.x = -1;
    this.y = -1;
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
