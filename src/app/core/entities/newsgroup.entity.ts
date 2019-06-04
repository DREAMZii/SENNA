import {News} from '@app/core/entities/news.entity';
import {Bubble} from '@app/core/entities/bubble/bubble.entity';
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

  public draw(single) {
    this.isDrawn = true;

    this.remove();

    this.group = this.bubble.getGroup()
      .insert('g', 'path:first-of-type')
      .attr('class', `news`)
      .style('opacity', '0');

    const angle = 360 / this.news.length * (this.news.indexOf(single) + 1);
    const factor = BubbleUtil.scalingFactor ** this.bubble.getReferredNumber();
    const point = BubbleUtil.getPointOnCircle(
      this.bubble.getCenterX(),
      this.bubble.getCenterY(),
      this.bubble.getRadius(),
      angle
    );
    const x = point[0];
    const y = point[1];

    const width = NewsUtil.width / factor;

    const fontSize = 12 / factor;

    const xOffset = 12 / factor;
    const yOffset = 15 / factor;

    const dyOffset = 7 / factor;
    const dy = yOffset + dyOffset;

    const text = this.group
      .append('text')
      .attr('news-id', this.news.indexOf(single))
      .attr('x', angle > 180 && angle !== 360 ? x - width : x)
      .attr('y', y)
      .attr('dx', xOffset)
      .attr('dy', dy)
      .attr('font-size', fontSize)
      .style('cursor', 'pointer')
      .call(NewsUtil.wrap, single, width, yOffset)
      .on('click', function() {
        const newsText = d3.select(this);
        const newsId = parseInt(newsText.attr('news-id'), 10);

        NewsUtil.openNews(BubbleUtil.getActiveBubble().getNews(newsId));
      })
      .on('mouseenter', () => {
        const rect = this.group.select('rect');
        if (rect.node() === null) {
          return;
        }

        rect
          .transition()
          .duration(500)
          .attr('fill', 'lightgray');
      })
      .on('mouseleave', () => {
        const rect = this.group.select('rect');
        if (rect.node() === null) {
          return;
        }

        rect
          .transition()
          .duration(500)
          .attr('fill', 'white');
      });

    const height = text.node().getBBox().height * 1.15;

    const rectW = width;
    const rectH = height;
    this.group
      .insert('rect', 'text')
      .attr('x', angle > 180 && angle !== 360 ? x - width : x)
      .attr('y', angle > 90 && angle < 270 ? y : y - rectH)
      .attr('width', rectW)
      .attr('height', rectH)
      .attr('fill', 'white')
      .style('cursor', 'pointer')
      .on('click', () => {
        const newsText = this.group.select('text');
        const newsId = parseInt(newsText.attr('news-id'), 10);

        NewsUtil.openNews(BubbleUtil.getActiveBubble().getNews(newsId));
      })
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('fill', 'lightgray');
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('fill', 'white');
      });

    this.group.selectAll('tspan')
      .attr('y', function() {
        return angle > 90 && angle < 270 ? y : y - height;
      });

    this.group.append('line')
      .style('stroke', single.getScoreColor())
      .style('stroke-width', 1 / factor)
      .attr('x1', x)
      .attr('y1', angle > 90 && angle < 270 ? y + height : y - height)
      .attr('x2', angle > 180 && angle !== 360 ? x - width : x + width)
      .attr('y2', angle > 90 && angle < 270 ? y + height : y - height);

    this.group.append('line')
      .style('stroke', single.getScoreColor())
      .style('stroke-width', 1 / factor)
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', angle > 90 && angle < 270 ? y + height : y - height);

    this.group.transition()
      .duration(750)
      .style('opacity', '1');
  }

  public remove() {
    this.isDrawn = false;

    this.bubble.getGroup()
      .selectAll('.news')
      .transition()
      .duration(750)
      .style('opacity', '0')
      .on('end', function() {
        d3.select(this)
          .remove();
      });
  }

  public getNews() {
    return this.news;
  }
}
