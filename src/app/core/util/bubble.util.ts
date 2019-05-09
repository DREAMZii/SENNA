import * as d3 from 'd3';
import {AzureService, ReferenceService} from "@app/services";

export class BubbleUtil {
  public static referenceService: ReferenceService;
  public static azureService: AzureService;

  // Standard values
  public static greenColor = '#8CA528';
  public static grayColor = '#E1E1E1';
  public static redColor = '#AE0055';
  public static lineColor = 'black';

  public static readonly positiveThreshhold = 0.55;
  public static readonly negativeThreshhold = 0.4;

  public static scale = 1;
  public static offsetX = 0;
  public static offsetY = 0;

  public static zoomToBubble(zoom, container, cx, cy, scale, callback?: Function) {
    const rect = container.node().getBoundingClientRect();

    const kx = (rect.width / 2) * (scale - 1);
    const ky = (rect.height / 2) * (scale - 1);

    const tx = (rect.width / 2 - cx) * (scale - 1);
    const ty = (rect.height / 2 - cy) * (scale - 1);

    const graphContainer = d3.select('#graphContainer');
    graphContainer.selectAll('g')
      .filter(function() {
        return d3.select(this).classed('bubble') || d3.select(this).classed('line');
      })
      .transition()
      .duration(750)
      .attr('transform', d3.zoomIdentity
        .translate(
          -kx + tx,
          -ky + ty
        ).scale(scale).toString())
      .on('end', function() {
        graphContainer.call(zoom.transform, d3.zoomIdentity.translate(-kx + tx, -ky + ty).scale(scale));

        if (callback instanceof Function) {
          callback();
        }
      });
  }

  /**
   * Connect two bubbles
   *
   * @param bubble1 - first bubble
   * @param bubble2 - second bubble
   */
  public static connect(bubble1, bubble2) {
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
      .style('stroke', BubbleUtil.lineColor)
      .style('stroke-width', 2 / 2 ** bubble1.getReferredNumber())
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2);
  }

  public static getPointOnCircle(cx, cy, radius, angle) {
    const angleInRad = BubbleUtil.getAngleInRadians(angle);

    const x = cx + radius * Math.cos(angleInRad);
    const y = cy + radius * Math.sin(angleInRad);

    return [x, y];
  }

  public static describeArc(x, y, radius, startAngle, endAngle) {
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = BubbleUtil.getAngleInRadians(angleInDegrees);

      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }

  public static getAngleInRadians(angleInDegrees) {
    return (angleInDegrees - 90) * Math.PI / 180.0
  }
}
