import {BubbleUtil} from "@app/core/util/bubble.util";
import {Bubble} from "@app/core/entities/bubble/bubble.entity";
import {NewsSentiment} from "@app/core/entities/news.entity";

export enum BubbleSegmentColor {
  GREEN = '#8CA528',
  GRAY = '#E1E1E1',
  RED = '#AE0055'
}

export class BubbleSegment {
  private static readonly angleShift = 25;
  private static readonly angleOffset = 2;

  private readonly type: NewsSentiment;
  private readonly color: BubbleSegmentColor;

  constructor(
    type: NewsSentiment,
    color: BubbleSegmentColor
  ) {
    this.type = type;
    this.color = color;
  }

  public draw(bubble: Bubble) {
    const startValue = bubble.getGroup().selectAll('path').size();

    const angleDistance = bubble.getAngleDistance();
    for (let i = startValue; i < startValue + bubble.getSegmentCount(this.type); i++) {
      bubble.getGroup()
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', this.color)
        .attr('stroke-width', bubble.getStrokeWidth())
        .attr('news-id', i)
        .attr('d', () => {
          return BubbleUtil.describeArc(
            bubble.getCenterX(),
            bubble.getCenterY(),
            bubble.getRadius(),
            i * angleDistance + BubbleSegment.angleOffset + BubbleSegment.angleShift,
            (i + 1) * angleDistance - BubbleSegment.angleOffset + BubbleSegment.angleShift
          );
        });
    }
  }
}
