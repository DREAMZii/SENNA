import {News} from '@app/core/entities/news.entity';
import {Bubble} from '@app/core/entities/bubble.entity';
import {BubbleUtil} from '@app/core/util/bubble.util';
import * as d3 from 'd3';
import {NewsUtil} from '@app/core/util/news.util';

export class NewsGroup {
  private readonly bubble: Bubble;
  private readonly news: News[];

  private group;
  private isDrawn = false;

  constructor(bubble, news: News[]) {
    this.bubble = bubble;
    this.news = news;
  }

  public draw() {
    this.bubble
      .getContainer()
      .selectAll('.news')
      .transition()
      .duration(750)
      .style('opacity', '0');

    if (this.isDrawn) {
      this.show();
      return;
    }

    const factor = BubbleUtil.scalingFactor ** this.bubble.getReferredNumber();
    const point = BubbleUtil.getPointOnCircle(this.bubble.getCenterX(), this.bubble.getCenterY(), this.bubble.getRadius(), 345);
    const x = point[0];
    const y = point[1];

    const width = NewsUtil.width / factor;

    const fontSize = 12 / factor;

    const xOffset = 12 / factor;
    const yOffset = 15 / factor;

    this.group = this.bubble.getGroup().insert('g', ':first-child')
      .attr('class', `news`)
      .style('opacity', '0');

    let height = 0;
    let newsCount = 0;
    for (const news of this.news) {
      const dyOffset = 7 / factor;
      const dy = (yOffset * ++newsCount) + dyOffset;

      const text = this.group.append('text')
        .attr('news-id', newsCount - 1)
        .attr('x', x)
        .attr('y', y + height)
        .attr('dx', xOffset)
        .attr('dy', dy)
        .attr('font-size', fontSize)
        .style('cursor', 'pointer')
        .text(news.getName())
        .call(NewsUtil.wrap, width, yOffset)
        .on('click', function() {
          const newsText = d3.select(this);
          const newsId = parseInt(newsText.attr('news-id'), 10);

          NewsUtil.openNews(BubbleUtil.getActiveBubble().getNews(newsId));
        })
        .on('mouseenter', function() {
          d3.select(this)
            .attr('filter', 'url(#solid)');
        })
        .on('mouseleave', function() {
          d3.select(this)
            .attr('filter', '');
        });

      height += text.node().getBBox().height;
    }

    height += this.bubble.getStrokeWidth();
    height += yOffset * this.group.selectAll('text').size();

    this.group.selectAll('tspan')
      .attr('y', function() {
        return parseFloat(d3.select(this).attr('y')) - height;
      });

    this.group.append('line')
      .style('stroke', 'green')
      .style('stroke-width', 1 / factor)
      .attr('x1', x)
      .attr('y1', y - height)
      .attr('x2', x + width)
      .attr('y2', y - height);

    this.group.append('line')
      .style('stroke', 'green')
      .style('stroke-width', 1 / factor)
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y - height);

    this.group.transition()
      .duration(750)
      .style('opacity', '1');

    this.isDrawn = true;
  }

  public show() {
    this.group
      .transition()
      .duration(750)
      .style('opacity', '1');
  }

  public getNews() {
    return this.news;
  }
}
