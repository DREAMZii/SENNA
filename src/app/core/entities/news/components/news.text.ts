import {News} from '@app/core/entities/news/news.entity';
import {NewsConfig} from '@app/core/config/news.config';
import {TextUtil} from '@app/core/util/text.util';
import {Bubble} from '@app/core/entities/bubble/bubble.entity';
import {NewsDisplay} from '@app/core/entities/news/news.display';

export class NewsText {
  private readonly news: News;

  private text: any;

  constructor(
    news: News
  ) {
    this.news = news;
  }

  /**
   * Draws the text for given news
   *
   * @param bubble  - to attach the news-text to
   * @param point   - to relate news-text to
   */
  public draw(bubble: Bubble, point: number[]) {
    const x = point[0];
    const y = point[1];
    const angle = 360 / bubble.getNews().length * (bubble.getNews().indexOf(this.news) + 1);

    const width = bubble.scaleDown(NewsConfig.WIDTH);

    const fontSize = bubble.scaleDown(NewsConfig.FONT_SIZE);

    const xOffset = bubble.scaleDown(NewsConfig.X_OFFSET);
    const yOffset = bubble.scaleDown(NewsConfig.Y_OFFSET);

    const dyOffset = bubble.scaleDown(NewsConfig.DY_OFFSET);
    const dy = yOffset + dyOffset;

    this.text = this.news
      .getGroup()
      .append('text')
      .attr('news-id', bubble.getNews().indexOf(this.news))
      .attr('x', angle > 180 && angle !== 360 ? x - width : x)
      .attr('y', y)
      .attr('dx', xOffset)
      .attr('dy', dy)
      .attr('font-size', fontSize)
      .style('cursor', 'pointer')
      .call(TextUtil.wrap, this.news, width, yOffset)
      .on('click', () => {
        NewsDisplay.open(this.news);
      })
      .on('mouseenter', () => {
        const rect = this.news.getGroup().select('rect');
        if (rect.node() === null) {
          return;
        }

        rect
          .transition()
          .duration(500)
          .attr('fill', 'lightgray');
      })
      .on('mouseleave', () => {
        const rect = this.news.getGroup().select('rect');
        if (rect.node() === null) {
          return;
        }

        rect
          .transition()
          .duration(500)
          .attr('fill', 'white');
      });
  }

  /** GETTER **/

  public getTextSelection() {
    return this.text;
  }
}
