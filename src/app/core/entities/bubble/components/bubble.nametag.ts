import {Bubble} from '../bubble.entity';
import {CircleUtil} from '../../../util/circle.util';
import {BubbleConfig} from '../../../config/bubble.config';
import {BubbleSegmentColor} from '@app/core/entities/bubble/components/bubble.segment';
import {BubbleAbstract} from '@app/core/entities/bubble/bubble.abstract';

export class BubbleNametag {
  private readonly bubble: Bubble;

  private nameWidth = 0;
  private nameHeight = 0;

  constructor(
    bubble: BubbleAbstract
  ) {
    this.bubble = bubble as Bubble;
  }

  public draw() {
    const fontSize = this.bubble.scaleDown(BubbleConfig.FONT_SIZE);

    const nameText = this.bubble
      .getGroup()
      .insert('text', 'path:first-child')
      .classed('name-button', true)
      .attr('font-size', fontSize)
      .style('cursor', 'pointer')
      .text(this.bubble.getSearchTerm());

    const mindWidth = this.bubble.scaleDown(BubbleConfig.NAMETAG_MIN_WIDTH);

    this.nameWidth = nameText.node().getBBox().width * 1.5;
    if (this.nameWidth <= mindWidth) {
      this.nameWidth = mindWidth;
    }
    this.nameHeight = nameText.node().getBBox().height * 1.5;

    const statisticsButtonWidth = this.nameWidth / 2;
    const corner = this.bubble.scaleDown(BubbleConfig.NAMETAG_CORNER_ROUND);
    this.bubble
      .getGroup()
      .insert('rect', ':first-child')
      .classed('name-button', true)
      .attr('x', this.bubble.getCenterX() - this.nameWidth  / 2 - statisticsButtonWidth * 1.5 / 2)
      .attr('y', this.bubble.getCenterY() + this.bubble.getRadius() * 1.5)
      .attr('rx', corner)
      .attr('ry', corner)
      .attr('width', this.nameWidth)
      .attr('height', this.nameHeight)
      .attr('fill', BubbleSegmentColor.GRAY)
      .style('cursor', 'pointer');

    nameText
      .attr('x',
        (this.bubble.getCenterX() - this.nameWidth / 2)
        + (this.nameWidth / 2)
        - nameText.node().getBBox().width / 2
        - statisticsButtonWidth * 1.5 / 2
      )
      .attr('y',
        (this.bubble.getCenterY() + this.bubble.getRadius() * 1.5)
        + (this.nameHeight / 1.5)
        + this.bubble.scaleDown(1.5)
      );
  }

  public getNameWidth() {
    return this.nameWidth;
  }

  public getNameHeight() {
    return this.nameHeight;
  }
}
