import * as d3 from 'd3';
import {BubbleUtil} from "@app/core/util/bubble.util";

export class NewsUtil {
  public static news = [];
  public static openArticles = new Map();

  public static openNewsId: number;

  public static readonly width = 200;

  public static openNews(news) {
    // Prepare data whether it is open or not
    if (this.openNewsId !== news.getId()) {
      this.prepareNews(news);
    }

    if (NewsUtil.isNewsOpen()) {
      return;
    }

    BubbleUtil.focusBubble(BubbleUtil.getActiveBubble(), () => {
      d3.select('svg').style('width', '63.5%');
    }, 0.6);

    d3.select('#senna-news')
      .classed('open', true)
      .transition()
      .duration(1000)
      .style('width', '36.5%');
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

    this.openNewsId = news.getId();

    // Is not open
    if (!this.openArticles.has(news.getId())) {
      this.openNewsTab(news);
    } else {
      const selectedNewsBox = d3.selectAll('.news-article')
        .filter(function() {
          return parseInt(d3.select(this).attr('news-id'), 10) === news.getId();
        });

      selectedNewsBox.call(this.markBoxAsActive);
    }
  }

  private static openNewsTab(news) {
    const openArticleBox = d3.select('#open-news-article')
      .append('div')
      .attr('news-id', news.getId())
      .classed('news-article', true)
      .classed('open-article', true)
      .style('width', '100%')
      .style('height', '15vh')
      .style('border', '1px gray solid')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('align-items', 'center')
      .style('cursor', 'pointer')
      .style('background-color', '#E1E1E1')
      .on('click', function() {
        const newsBox = d3.select(this);
        if (!newsBox.classed('open-article')) {
          newsBox.call(NewsUtil.markBoxAsActive);
        }

        const newsId = parseInt(newsBox.attr('news-id'), 10);
        NewsUtil.openNews(NewsUtil.news[newsId]);
      })
      .on('dblclick', function() {
        const newsBox = d3.select(this);
        const newsId = parseInt(newsBox.attr('news-id'), 10);

        const boxBefore = (newsBox.node() as HTMLElement).previousElementSibling;
        const boxAfter = (newsBox.node() as HTMLElement).nextElementSibling;

        NewsUtil.openArticles.delete(newsId);
        newsBox.remove();

        if (NewsUtil.openArticles.size <= 0) {
          NewsUtil.closeNews();
        } else if (newsId === NewsUtil.openNewsId) {
          const newActiveBox = boxBefore === null ? d3.select(boxAfter) : d3.select(boxBefore);
          newActiveBox.call(NewsUtil.markBoxAsActive);

          const newActiveNewsId = parseInt(newActiveBox.attr('news-id'), 10);
          NewsUtil.openNews(NewsUtil.news[newActiveNewsId]);
        }
      });

    openArticleBox.call(this.markBoxAsActive);

    openArticleBox.append('div')
      .style('text-align', 'center')
      .style('writing-mode', 'vertical-rl')
      .style('transform', 'rotate(180deg)')
      .text(news.getName().substring(0, 25) + '...');

    this.openArticles.set(news.getId(), news);
  }

  private static markBoxAsActive(newsBox) {
    d3.select('.open-article')
      .classed('open-article', false);

    newsBox
      .classed('open-article', true);

    d3.selectAll('.news-article')
      .filter(function() {
        return !d3.select(this).classed('open-article');
      })
      .transition()
      .duration(500)
      .style('color', 'lightgray')
      .style('background-color', '#f4f4f4');

    newsBox
      .classed('open-article', true)
      .transition()
      .duration(500)
      .style('background-color', '#E1E1E1')
      .style('color', 'green');
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
