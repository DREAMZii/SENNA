import * as d3 from 'd3';

export class BubbleUtil {
  // Storage
  public static bubbles = [];
  public static bubblesByName = new Map();

  // Standard values
  public static greenColor = '#8CA528';
  public static grayColor = '#E1E1E1';
  public static redColor = '#AE0055';
  public static lineColor = 'black';

  public static readonly positiveThreshhold = 0.55;
  public static readonly negativeThreshhold = 0.4;

  public static angleShift = 90;

  public static scalingFactor = 1.5;
  public static scale = 1;
  public static offsetX = 0;
  public static offsetY = 0;

  public static radius = 100;

  // Settings
  public static zoomDisabled = false;

  public static getActiveBubble() {
    const activeBubbleId = parseInt(d3.select('.active').select('circle').attr('bubble-id'), 10);
    return BubbleUtil.bubbles[activeBubbleId];
  }

  public static focusBubble(bubble, callback?, focusOnWidth = 1, duration = 750) {
    if (this.zoomDisabled) {
      return;
    }

    if (bubble !== this.getActiveBubble()) {
      d3.selectAll('.stats')
        .transition()
        .duration(750)
        .attr('height', 0)
        .on('end', function() {
          d3.select(this).remove();
        });

      this.getActiveBubble().newsGroup.remove();
    }

    const rect = bubble.container.node().getBoundingClientRect();

    const scale = BubbleUtil.scalingFactor ** bubble.referredNumber;

    const kx = ((rect.width * focusOnWidth) / 2) * (scale - 1);
    const ky = (rect.height / 2) * (scale - 1);

    const tx = ((rect.width * focusOnWidth) / 2 - bubble.x) * scale;
    const ty = (rect.height / 2 - bubble.y) * scale;

    const graphContainer = d3.select('#graphContainer');
    let blockedCallback = false;
    graphContainer.selectAll('g')
      .filter(function() {
        return d3.select(this).classed('bubble') || d3.select(this).classed('line');
      })
      .transition()
      .duration(duration)
      .attr('transform', d3.zoomIdentity
        .translate(
          -kx + tx,
          -ky + ty
        ).scale(scale).toString())
      .on('end', function() {
        // Only use callback once instead, not for every circle
        if (blockedCallback) {
          return;
        }

        graphContainer.call(bubble.zoom.transform, d3.zoomIdentity.translate(-kx + tx, -ky + ty).scale(scale));

        BubbleUtil.scale = scale;
        BubbleUtil.offsetX = -kx + tx;
        BubbleUtil.offsetY = -ky + ty;

        BubbleUtil.markActiveBubble(bubble.container, bubble.group);


        if (callback instanceof Function) {
          callback();
        }

        blockedCallback = true;
      });
  }

  private static markActiveBubble(container, group) {
    container.selectAll('g')
      .filter('.bubble')
      .classed('active', false)
      .classed('inactive', true)
      .transition()
      .style('opacity', '0.5');

    group
      .classed('active', true)
      .classed('inactive', false)
      .transition()
      .style('opacity', '1');
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
    const x1 = bubble1.getCenterX() + (bubble1.getRadius() + bubble1.strokeWidth) * Math.cos(angleInRad1);
    const y1 = bubble1.getCenterY() + (bubble1.getRadius() + bubble1.strokeWidth) * Math.sin(angleInRad1);

    // Find point on circle 2
    const x2 = bubble2.getCenterX() + (bubble2.getRadius() + bubble2.strokeWidth) * Math.cos(angleInRad2);
    const y2 = bubble2.getCenterY() + (bubble2.getRadius() + bubble2.strokeWidth) * Math.sin(angleInRad2);

    const group = d3.select('#graphContainer')
      .select('#canvas')
      .insert('g', 'g:first-of-type')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('transform', `translate(${BubbleUtil.offsetX}, ${BubbleUtil.offsetY}) scale(${BubbleUtil.scale})`)
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
    function polarToCartesian(centerX, centerY, cartesianRadius, angleInDegrees) {
      const angleInRadians = BubbleUtil.getAngleInRadians(angleInDegrees);

      return {
        x: centerX + (cartesianRadius * Math.cos(angleInRadians)),
        y: centerY + (cartesianRadius * Math.sin(angleInRadians))
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
    return (angleInDegrees - 90) * Math.PI / 180.0;
  }
}
