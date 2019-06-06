import * as d3 from 'd3';
import {NewsManager} from '@app/core/entities/news/news.manager';
import {StaticService} from '@app/services/static.service';
import {BubbleManager} from '@app/core/entities/bubble/bubble.manager';
import {Focus} from '@app/core/animations/focus.animation';

export class NewsDisplay {
  public static isNewsOpen() {
    return d3.select('#senna-news').classed('open');
  }

  public static open(news) {
    // Prepare data whether it is open or not
    if (NewsManager.openNewsId !== news.getId()) {
      NewsDisplay.prepareNews(news);
    }

    NewsManager.openNewsId = news.getId();

    if (NewsDisplay.isNewsOpen()) {
      return;
    }

    d3.select('#alert-boxes').style('right', '42.5%');
    Focus.focus(BubbleManager.getActiveBubble(), () => {
      d3.select('#canvas').style('width', '63.5%');
    }, 0.635);

    d3.select('#senna-news')
      .classed('open', true)
      .transition()
      .duration(1000)
      .style('width', '36.5%')
      .on('end', function() {
        d3.select('#close-button').style('display', null);
      });
  }

  private static prepareNews(news) {
    d3.select('#news-source div')
      .text(news.getSource());

    const date = new Date(news.getDatePublished());

    d3.select('#news-date div')
      .text(date.toLocaleDateString('de-DE'));

    d3.select('#news-score div.score-score')
      .text(Math.trunc(news.getScore() * 100));

    d3.select('#news-score div.score-indicator')
      .attr('title', Math.trunc(news.getScore() * 100) + '%')
      .style('background-color', news.getScoreColor());

    d3.select('#news-headline h2')
      .text(news.getName());

    // Make iframe etc. invisible
    d3.select('#senna-news iframe')
      .attr('src', null)
      .style('display', 'none');

    d3.select('#senna-news .news-fallback')
      .style('display', 'none')
      .select('a')
      .attr('href', null);

    if (news.getUrl().startsWith('https://')) {
      d3.select('#news-loading')
        .style('display', 'block');

      StaticService.referenceService.isContentAvailable(news.getUrl()).then((result) => {
        // Dont know why this doesnt work as boolean, works as string tho
        if (result === 'true') {
          d3.select('#senna-news iframe')
            .attr('src', news.getUrl())
            .style('display', 'block')
            .on('load', () => {
              d3.select('#news-loading')
                .style('display', 'none');
            });

          d3.select('#senna-news .news-fallback')
            .style('display', 'none')
            .select('a')
            .attr('href', null);
        } else {
          d3.select('#news-loading')
            .style('display', 'none');

          d3.select('#senna-news iframe')
            .attr('src', null)
            .style('display', 'none');

          d3.select('#senna-news .news-fallback')
            .style('display', 'block')
            .select('a')
            .attr('href', news.getUrl());
        }
      });
    } else {
      d3.select('#news-loading')
        .style('display', 'none');

      d3.select('#senna-news iframe')
        .attr('src', null)
        .style('display', 'none');

      d3.select('#senna-news .news-fallback')
        .style('display', 'block')
        .select('a')
        .attr('href', news.getUrl());
    }

    // Is not open
    if (!NewsManager.openArticles.has(news.getId())) {
      NewsDisplay.openNewsTab(news);
    } else {
      const selectedNewsBox = d3.selectAll('.news-article')
        .filter(function() {
          return parseInt(d3.select(this).attr('news-id'), 10) === news.getId();
        });

      selectedNewsBox.call(NewsDisplay.markBoxAsActive);
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
          newsBox.call(NewsDisplay.markBoxAsActive);
        }

        const newsId = parseInt(newsBox.attr('news-id'), 10);
        NewsDisplay.open(NewsManager.news[newsId]);
      });

    openArticleBox.call(this.markBoxAsActive);

    openArticleBox.append('div')
      .style('text-align', 'center')
      .style('writing-mode', 'vertical-rl')
      .style('transform', 'rotate(180deg)')
      .text(news.getName().substring(0, 25) + '...');

    NewsManager.openArticles.set(news.getId(), news);
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
      .style('color', 'rgb(100, 100, 100)');
  }

  public static removeActiveNews() {
    const newsBox = d3.selectAll('.news-article')
      .filter(function() {
        return parseInt(d3.select(this).attr('news-id'), 10) === NewsManager.openNewsId;
      });

    const boxBefore = (newsBox.node() as HTMLElement).previousElementSibling;
    const boxAfter = (newsBox.node() as HTMLElement).nextElementSibling;

    NewsManager.openArticles.delete(NewsManager.openNewsId);
    newsBox.remove();

    if (NewsManager.openArticles.size <= 0) {
      NewsDisplay.closeNews();
      NewsManager.openNewsId = -1;
    } else {
      const newActiveBox = boxBefore === null ? d3.select(boxAfter) : d3.select(boxBefore);
      const newActiveNewsId = parseInt(newActiveBox.attr('news-id'), 10);
      NewsDisplay.open(NewsManager.news[newActiveNewsId]);
      newActiveBox.call(NewsDisplay.markBoxAsActive);
    }
  }

  public static closeNews() {
    if (!NewsDisplay.isNewsOpen()) {
      return;
    }

    d3.select('#news-loading')
      .style('display', 'none');

    d3.select('#alert-boxes').style('right', '6.5%');
    d3.select('#canvas')
      .style('width', '100%');
    Focus.focus(BubbleManager.getActiveBubble());

    d3.select('#senna-news')
      .classed('open', false)
      .transition()
      .duration(750)
      .style('width', '0%')
      .on('start', function() {
        d3.select('#close-button').style('display', 'none');
      });
  }
}
