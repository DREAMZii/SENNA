import {Animation} from "@app/core/animations/animation.interface";
import {BubbleManager} from "@app/core/entities/bubble/bubble.manager";
import * as d3 from "d3";
import {BubbleConfig} from "@app/core/config/bubble.config";

export class Focus implements Animation {
  public static currentScale = 0;
  public static currentTranslateX = 0;
  public static currentTranslateY = 0;

  public static focus(bubble, callback?, focusOnWidth = 1, duration = 750) {
    if (bubble !== BubbleManager.getActiveBubble()) {
      Focus.removeStatsAndNews();
    }

    const rect = bubble.getContainer().node().getBoundingClientRect();

    const scale = BubbleConfig.SCALING_FACTOR ** bubble.getReferredNumber();

    const kx = ((rect.width * focusOnWidth) / 2) * (scale - 1);
    const ky = (rect.height / 2) * (scale - 1);

    const tx = ((rect.width * focusOnWidth) / 2 - bubble.getCenterX()) * scale;
    const ty = (rect.height / 2 - bubble.getCenterY()) * scale;

    const graphContainer = d3.select('#graphContainer');

    Focus.currentScale = scale;
    Focus.currentTranslateX = -kx + tx;
    Focus.currentTranslateY = -ky + ty;

    // Just to make sure we use the callback once
    let blockedCallback = false;
    graphContainer.selectAll('g')
      .filter(function() {
        return d3.select(this).classed('bubble') || d3.select(this).classed('line');
      })
      .transition()
      .duration(duration)
      .attr('transform', d3.zoomIdentity
        .translate(
          Focus.currentTranslateX,
          Focus.currentTranslateY
        ).scale(scale).toString())
      .on('end', function() {
        // Only use callback once instead, not for every circle
        if (blockedCallback) {
          return;
        }

        graphContainer.call(
          bubble.getZoom().transform,
          d3.zoomIdentity.translate(Focus.currentTranslateX, Focus.currentTranslateY).scale(scale)
        );

        Focus.markBubbleAsActive(bubble);

        if (callback instanceof Function) {
          callback();
        }

        blockedCallback = true;
      });
  }

  private static removeStatsAndNews() {
    d3.selectAll('text.stats, rect.stats')
      .transition()
      .duration(750)
      .style('opacity', 0)
      .on('end', function () {
        d3.select(this).remove();
      });

    BubbleManager.getActiveBubble().getNewsGroup().remove();
  }

  private static markBubbleAsActive(bubble) {
    bubble.getContainer()
      .selectAll('g')
      .filter('.bubble')
      .classed('active', false)
      .classed('inactive', true)
      .transition()
      .style('opacity', '0.5');

    bubble.getGroup()
      .classed('active', true)
      .classed('inactive', false)
      .transition()
      .style('opacity', '1');

    BubbleManager.setActiveBubble(bubble);
  }
}
