import {Bubble} from '@app/core/entities/bubble/bubble.entity';
import {BubbleAbstract} from '@app/core/entities/bubble/bubble.abstract';
import {BubbleConfig} from '@app/core/config/bubble.config';

export class BubbleImage {
  private readonly bubble: Bubble;

  constructor(
    bubble: BubbleAbstract
  ) {
    this.bubble = bubble as Bubble;
  }

  public draw() {
    if (this.bubble.getSearchImage() === '') {
      const text = this.bubble
        .getGroup()
        .append('text')
        .attr('font-size', this.bubble.scaleDown(BubbleConfig.FONT_SIZE))
        .text(this.bubble.getSearchTerm());

      const width = text.node().getComputedTextLength();
      text
        .attr('x', this.bubble.getCenterX() - width / 2)
        .attr('y', this.bubble.getCenterY);
    } else {
      const rectWH = this.bubble.getRadius() + this.bubble.getRadius() / 3.5;

      this.bubble
        .getGroup()
        .append('rect')
        .attr('id', 'bubble-rect-' + this.bubble.getId())
        .attr('x', this.bubble.getCenterX() - rectWH / 2)
        .attr('y', this.bubble.getCenterY() - rectWH / 2)
        .attr('rx', this.bubble.scaleDown(20))
        .attr('ry', this.bubble.scaleDown(20))
        .attr('width', rectWH)
        .attr('height', rectWH)
        .attr('xlink:href', this.bubble.getSearchImage())
        .attr('clip-path', 'url(#clip)');

      this.bubble
        .getContainer()
        .select('#clip')
        .append('use')
        .attr('xlink:href', '#bubble-rect-' + this.bubble.getId());

      this.bubble
        .getGroup()
        .append('image')
        .attr('x', this.bubble.getCenterX() - rectWH / 2)
        .attr('y', this.bubble.getCenterY() - rectWH / 2)
        .attr('width', rectWH)
        .attr('height', rectWH)
        .attr('xlink:href', this.bubble.getSearchImage())
        .attr('clip-path', 'url(#clip)');
    }
  }
}
