import {News} from '@app/core/entities/news/news.entity';
import {NewsText} from '@app/core/entities/news/components/news.text';
import {NewsConfig} from '@app/core/config/news.config';
import * as d3 from 'd3';
import {Bubble} from '@app/core/entities/bubble/bubble.entity';
import {NewsDisplay} from '@app/core/entities/news/news.display';

export class NewsBox {
  private readonly news: News;
  private readonly text: NewsText;

  constructor(
    news: News,
    text: NewsText
  ) {
    this.news = news;
    this.text = text;
  }

  /**
   * Draws the box for given news
   *
   * @param bubble  - to attach the news-box to
   * @param point   - to relate news-box to
   */
  public draw(bubble: Bubble, point: number[]) {
    const x = point[0];
    const y = point[1];
    const angle = 360 / bubble.getNews().length * (bubble.getNews().indexOf(this.news) + 1);
    const height = this.text.getTextSelection().node().getBBox().height * 1.15;

    const width = bubble.scaleDown(NewsConfig.WIDTH);
    const rectH = height;
    this.news
      .getGroup()
      .insert('rect', 'text')
      .attr('x', angle > 180 && angle !== 360 ? x - width : x)
      .attr('y', angle > 90 && angle < 270 ? y : y - rectH)
      .attr('width', width)
      .attr('height', rectH)
      .attr('fill', 'white')
      .style('cursor', 'pointer')
      .on('click', () => {
        NewsDisplay.open(this.news);
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

    this.news.getGroup().selectAll('tspan')
      .attr('y', function() {
        return angle > 90 && angle < 270 ? y : y - height;
      });

    this.news.getGroup().append('line')
      .style('stroke', this.news.getScoreColor())
      .style('stroke-width', bubble.scaleDown(1))
      .attr('x1', x)
      .attr('y1', angle > 90 && angle < 270 ? y + height : y - height)
      .attr('x2', angle > 180 && angle !== 360 ? x - width : x + width)
      .attr('y2', angle > 90 && angle < 270 ? y + height : y - height);

    this.news.getGroup().append('line')
      .style('stroke', this.news.getScoreColor())
      .style('stroke-width', bubble.scaleDown(1))
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', angle > 90 && angle < 270 ? y + height : y - height);
  }
}
