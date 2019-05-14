import * as d3 from 'd3';
import {BubbleUtil} from "@app/core/util/bubble.util";

export class NewsUtil {
  public static readonly width = 200;

  public static openNews(news) {
    // Prepare data whether it is open or not
    this.prepareNews(news);

    if (NewsUtil.isNewsOpen()) {
      return;
    }

    BubbleUtil.focusBubble(BubbleUtil.getActiveBubble(), () => {
      d3.select('svg').style('width', '60%');
    }, 0.6);

    d3.select('#senna-news')
      .classed('open', true)
      .transition()
      .duration(1000)
      .style('width', '40%');
  }

  private static prepareNews(news) {
    d3.select('#news-source div')
      .text(news.getSource());

    const date = new Date(news.getDatePublished());

    d3.select('#news-date div')
      .text(date.toLocaleDateString('de-DE'));

    d3.select('#news-score div')
      .text(news.getScore());

    d3.select('#news-headline h2')
      .text(news.getName());

    d3.select('#senna-news iframe')
      .attr('src', news.getUrl());
  }

  public static closeNews() {
    if (!NewsUtil.isNewsOpen()) {
      return;
    }

    d3.select('svg').style('width', '100%');
    BubbleUtil.focusBubble(BubbleUtil.getActiveBubble());

    d3.select('#senna-news')
      .classed('open', false)
      .transition()
      .duration(1000)
      .style('width', '0%');
  }

  public static isNewsOpen() {
    return d3.select('#senna-news').classed('open');
  }

  public static wrap(textContainer, width, lineHeight) {
    textContainer.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const x = text.attr('x');
      const y = text.attr('y');
      const dx = parseFloat(text.attr('dx'));
      const dy = parseFloat(text.attr('dy'));

      let word;
      let lineNumber = 0;
      let line = [];
      let tspan = text
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dx', dx + 'px')
        .attr('dy', dy + 'px');

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dx', dx + 'px')
            .attr('dy', ++lineNumber * lineHeight + dy + 'px')
            .text(word);
        }
      }
    });
  }
}
