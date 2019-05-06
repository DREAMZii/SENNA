import * as d3 from 'd3';

export class Bubble {
  // Color values
  private static greenColor = 'green';
  private static grayColor = 'gray';
  private static redColor = 'red';

  // Relevant fields
  private readonly container: any;
  private svg: any;
  private readonly greenSegments: number;
  private readonly graySegments: number;
  private readonly redSegments: number;
  private readonly radius: number;
  private x: number;
  private y: number;

  /**
   * Constructor for Bubble instance
   *
   * @param greenSegments - amount of green segments in circle
   * @param graySegments  - amount of gray segments in circle
   * @param redSegments   - amount of red segments in circle
   * @param radius        - radius of bubble
   * @param container     - container where the svg should be located
   */
  constructor(greenSegments = 3, graySegments = 3, redSegments = 3, radius = 50, container = '#graphContainer') {
    this.container = d3.select(container);
    this.greenSegments = greenSegments;
    this.graySegments = graySegments;
    this.redSegments = redSegments;
    this.radius = radius;
  }

  /**
   * Spawns circle
   *
   * @param positionX - possible starting X coordinate (uses centered x of svg when not given)
   * @param positionY - possible starting Y coordinate (uses centered y of svg when not given)
   */
  public spawn(positionX?, positionY?) {
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', 'auto')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0);

    this.draw(this.greenSegments, Bubble.greenColor, positionX, positionY)
      .draw(this.graySegments, Bubble.grayColor, positionX, positionY)
      .draw(this.redSegments, Bubble.redColor, positionX, positionY);

    this.handleZoom(this.container);
  }

  private draw(segments, color, positionX?, positionY?) {
    const startValue = this.svg.selectAll('path').size();
    const rect = this.svg.node().getBoundingClientRect();

    this.x = positionX ? positionX : rect.width / 2;
    this.y = positionY ? positionY : rect.height / 2;

    const angleDistance = 360 / (this.greenSegments + this.graySegments + this.redSegments);
    for (let i = startValue; i < startValue + segments; i++) {
      this.svg.append('path')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', this.radius / 5)
        .attr('d', () => {
          return this.describeArc(
            this.x,
            this.y,
            this.radius,
            i * angleDistance + 1,
            (i + 1) * angleDistance - 1
          );
        });
    }

    return this;
  }

  private handleZoom(container) {
    const zoom_handler = d3.zoom().on('zoom', zoom_actions);
    function zoom_actions() {
      container.selectAll('svg').attr('transform', d3.event.transform);
    }

    zoom_handler(d3.select('#graphContainer'));
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

  /**
   * Despawns circle
   */
  public despawn() {
    this.svg.remove();

    this.svg = null;
    this.x = -1;
    this.y = -1;
  }

  public isSpawned() {
    return this.svg !== null;
  }

  public getSvg() {
    return this.svg;
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
