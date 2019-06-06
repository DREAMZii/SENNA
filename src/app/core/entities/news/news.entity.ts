import {BubbleSegmentColor} from '../bubble/components/bubble.segment';
import {CircleUtil} from '../../util/circle.util';
import * as d3 from 'd3';
import {Bubble} from '../bubble/bubble.entity';
import {NewsConfig} from '../../config/news.config';
import {NewsAbstract} from '@app/core/entities/news/news.abstract';
import {NewsText} from '@app/core/entities/news/components/news.text';
import {NewsBox} from '@app/core/entities/news/components/news.box';

export enum NewsSentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE'
}

export class News extends NewsAbstract {
  // Sentiment values
  private sentiment: NewsSentiment;
  private color = BubbleSegmentColor.GRAY;

  // Graphic values
  private group: any;

  // Score and availability
  public contentAvailable = false;
  public score = 0.5;

  /** STATIC **/

  /**
   * Removes all given bubbles on hand
   */
  public static remove() {
    d3.selectAll('.news')
      .transition()
      .duration(750)
      .style('opacity', '0')
      .on('end', function() {
        d3.select(this).remove();
      });
  }

  /** INSTANCE **/

  constructor(name, description, category, url, datePublished, source) {
    super(name, description, category, url, datePublished, source);
  }

  /**
   * @inheritDoc
   */
  public draw(bubble: Bubble) {
    News.remove();

    if (this.isOpen()) {
      return;
    }

    this.group = bubble.getGroup()
      .insert('g', 'path:first-of-type')
      .attr('id', 'news-group-' + this.id)
      .attr('class', `news`)
      .style('opacity', '0');

    const angle = 360 / bubble.getNews().length * (bubble.getNews().indexOf(this) + 1);
    const point = CircleUtil.getPointOnCircle(
      bubble.getCenterX(),
      bubble.getCenterY(),
      bubble.getRadius(),
      angle
    );

    const text = new NewsText(this);
    text.draw(bubble, point);

    const box = new NewsBox(this, text);
    box.draw(bubble, point);

    this.group.transition()
      .duration(750)
      .style('opacity', '1');
  }

  private isOpen() {
    return d3.select('#news-group-' + this.id).node() !== null;
  }

  /** GETTER **/

  public getGroup() {
    return this.group;
  }

  public getScore() {
    return this.score;
  }

  public getScoreColor() {
    return this.color;
  }

  public getSentiment() {
    if (this.sentiment !== undefined) {
      return this.sentiment;
    }

    if (this.score >= NewsConfig.POSITIVE_THRESHHOLD) {
      this.sentiment = NewsSentiment.POSITIVE;
      this.color = BubbleSegmentColor.GREEN;
    } else if (this.score > NewsConfig.NEGATIVE_THRESHHOLD && this.score < NewsConfig.POSITIVE_THRESHHOLD) {
      this.sentiment = NewsSentiment.NEUTRAL;
      this.color = BubbleSegmentColor.GRAY;
    } else {
      this.sentiment = NewsSentiment.NEGATIVE;
      this.color = BubbleSegmentColor.RED;
    }

    return this.sentiment;
  }
}
