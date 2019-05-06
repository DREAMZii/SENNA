import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({ providedIn: 'root' })
export class BubbleService {
  defaultRadius = 50;

  /**
   * Spawns circle in the center of screen
   *
   * @param greenSegments - number of green segments
   * @param graySegments  - number of gray segments
   * @param redSegments   - number of red segments
   * @param radius        - radius of circle in pixel
   * @param positionX     - possible starting X coordinate
   * @param positionY     - possible starting Y coordinate
   */
  public spawnCircle(greenSegments = 3, graySegments = 3, redSegments = 3, radius = this.defaultRadius, positionX?, positionY?) {
    const svg = d3.select('#graphContainer')
      .append('svg')
      .attr('width', '100%')
      .attr('height', 'auto')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0);

    const segments = greenSegments + graySegments + redSegments;
    const angleDistance = 360 / segments;

    this.draw(svg, greenSegments, 'green', radius, angleDistance, positionX, positionY)
      .draw(svg, graySegments, 'gray', radius, angleDistance, positionX, positionY)
      .draw(svg, redSegments, 'red', radius, angleDistance, positionX, positionY);

    const zoom_handler = d3.zoom().on('zoom', zoom_actions);
    function zoom_actions() {
      d3.select('#graphContainer').selectAll('svg').attr('transform', d3.event.transform);
    }

    zoom_handler(d3.select('#graphContainer'));

    return svg;
  }

  private draw(svg, segments, color, radius, angleDistance, positionX?, positionY?) {
    const startValue = svg.selectAll('path').size();
    const rect = svg.node().getBoundingClientRect();

    for (let i = startValue; i < startValue + segments; i++) {
      svg.append('path')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 10)
        .attr('d', () => {
          return this.describeArc(
            positionX ? positionX : rect.width / 2,
            positionY ? positionY : rect.height / 2,
            radius ? radius : this.defaultRadius,
            i * angleDistance + 1,
            (i + 1) * angleDistance - 1
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
}
