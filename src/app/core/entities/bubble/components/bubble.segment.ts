import {CircleUtil} from '../../../util/circle.util';
import {Bubble} from '../bubble.entity';
import {News, NewsSentiment} from '../../news/news.entity';
import {ZoomConfig} from '../../../config/zoom.config';
import {Focus} from '../../../animations/focus.animation';
import {NewsManager} from '@app/core/entities/news/news.manager';

export enum BubbleSegmentColor {
  GREEN = '#8CA528',
  GRAY = '#E1E1E1',
  RED = '#AE0055'
}

export class BubbleSegment {
  // Every segment is shifted for 25 degrees
  private static readonly angleShift = 25;
  // Every segment is seperated by 2 degrees for a distance between them
  private static readonly angleOffset = 2;

  private readonly bubble: Bubble;
  private readonly newsId: number;
  private readonly type: NewsSentiment;
  private readonly color: BubbleSegmentColor;

  private path;

  constructor(
    bubble,
    news: News
  ) {
    this.bubble = bubble;
    this.newsId = news.getId();
    this.type = news.getSentiment();
    this.color = news.getScoreColor();
  }

  public draw() {
    const startValue = this.bubble.getGroup().selectAll('path').size();
    const startAngle = (startValue * this.bubble.getAngleDistance()) + BubbleSegment.angleOffset + BubbleSegment.angleShift;
    const endAngle = ((startValue + 1) * this.bubble.getAngleDistance()) - BubbleSegment.angleOffset + BubbleSegment.angleShift;

    this.path = this.bubble.getGroup()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('stroke-width', this.bubble.getStrokeWidth())
      .attr('news-id', this.newsId)
      .attr('d', () => {
        return CircleUtil.describeArc(
          this.bubble.getCenterX(),
          this.bubble.getCenterY(),
          this.bubble.getRadius(),
          startAngle,
          endAngle
        );
      });

    this.registerEvents();
  }

  private registerEvents() {
    // Path events for news
    this.path.on('mouseover', () => {
      if (ZoomConfig.zoomDisabled) {
        return;
      }

      this.path
        .transition()
        .attr('stroke-width', this.bubble.getStrokeWidth() * 2)
        .style('cursor', 'pointer');
    }).on('mouseout', () => {
      if (ZoomConfig.zoomDisabled) {
        return;
      }

      this.path
        .transition()
        .attr('stroke-width', this.bubble.getStrokeWidth())
        .style('cursor', 'default');
    }).on('click', () => {
      if (ZoomConfig.zoomDisabled) {
        return;
      }

      NewsManager
        .news[this.newsId]
        .draw(this.bubble);
      Focus.focus(this.bubble);
    });
  }
}
