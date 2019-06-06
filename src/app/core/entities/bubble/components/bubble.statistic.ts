import {Bubble} from '../bubble.entity';
import {CircleUtil} from '../../../util/circle.util';
import {BubbleConfig} from '../../../config/bubble.config';
import {ZoomConfig} from '../../../config/zoom.config';
import {BubbleManager} from '../bubble.manager';
import {StaticService} from '../../../../services/static.service';
import * as d3 from 'd3';
import {Focus} from '../../../animations/focus.animation';
import {News} from '../../news/news.entity';
import {BubbleNametag} from '@app/core/entities/bubble/components/bubble.nametag';
import {BubbleSegmentColor} from '@app/core/entities/bubble/components/bubble.segment';
import {BubbleAbstract} from '@app/core/entities/bubble/bubble.abstract';

export class BubbleStatistic {
  private readonly bubble: Bubble;
  private readonly nameTag: BubbleNametag;

  constructor(
    bubble: BubbleAbstract,
    nameTag: BubbleNametag
  ) {
    this.bubble = bubble as Bubble;
    this.nameTag = nameTag;
  }

  public draw() {
    const nameW = this.nameTag.getNameWidth();
    const nameH = this.nameTag.getNameHeight();
    const statisticsButtonWidth = this.nameTag.getNameWidth() / 2;

    const corner = this.bubble.scaleDown(BubbleConfig.NAMETAG_CORNER_ROUND);
    this.bubble
      .getGroup()
      .insert('rect', ':first-child')
      .classed('stats-button', true)
      .attr('x', this.bubble.getCenterX() - nameW / 2 + statisticsButtonWidth * 1.5)
      .attr('y', this.bubble.getCenterY() + (this.bubble.getRadius() * 1.5))
      .attr('rx', corner)
      .attr('ry', corner)
      .attr('width', statisticsButtonWidth)
      .attr('height', nameH)
      .attr('fill', BubbleSegmentColor.GRAY)
      .style('cursor', 'pointer');

    this.bubble
      .getGroup()
      .insert('image', 'rect:first-child + *')
      .classed('stats-button', true)
      .attr('xlink:href', 'assets/images/statistics.svg')
      .attr('x', this.bubble.getCenterX() - nameW / 2 + statisticsButtonWidth * 1.5)
      .attr('y', this.bubble.getCenterY() + (this.bubble.getRadius() * 1.5))
      .attr('width', statisticsButtonWidth)
      .attr('height', nameH)
      .style('cursor', 'pointer')
      .on('click', () => {
        this.openStatistics(nameW, nameH, statisticsButtonWidth);
      });
  }

  private openStatistics(nameW, nameH, statisticsButtonWidth) {
    if (ZoomConfig.zoomDisabled && BubbleManager.getActiveBubble() !== this.bubble) {
      return;
    }

    if (this.bubble.isReferencesSpawned() && this.bubble.getReferences().length <= 0) {
      StaticService.alertService.warning('No references for term ' + this.bubble.getSearchTerm().toUpperCase() + '!');
    }

    let selection = this.bubble.getGroup().select('#statistics-' + this.bubble.getId());

    // When not open, create the general things
    let initRectX;
    let initRectY;
    if (selection.node() === null) {
      initRectX = this.bubble.getCenterX() - nameW / 2 - statisticsButtonWidth * 1.5 / 2;
      initRectY = this.bubble.getCenterY() + (this.bubble.getRadius() * 1.5) + nameH + (nameH * 0.2);

      const corner = this.bubble.scaleDown(BubbleConfig.NAMETAG_CORNER_ROUND);
      selection = this.bubble
        .getGroup()
        .insert('rect', ':first-child')
        .attr('id', 'statistics-' + this.bubble.getId())
        .classed('stats', true)
        .attr('rx', corner)
        .attr('ry', corner)
        .attr('x', initRectX)
        .attr('y', initRectY)
        .attr('width', nameW + statisticsButtonWidth + statisticsButtonWidth / 4)
        .attr('full-height', nameH * 10)
        .attr('height', 0)
        .attr('fill', BubbleSegmentColor.GRAY);
    } else {
      d3.selectAll('text.stats, rect.stats')
        .transition()
        .duration(750)
        .style('opacity', 0)
        .on('end', function () {
          d3.select(this).remove();
        });

      return;
    }

    const estimatedHeight = parseFloat(selection.attr('full-height'));
    const width = nameW + statisticsButtonWidth + statisticsButtonWidth / 4;

    const greenPercent = this.bubble.getOldPosAmount() * 100 / this.bubble.getOldNewsAmount();
    const greenHeight = nameH * 10 * 0.6 * greenPercent / 100;
    const greenDiff = estimatedHeight - greenHeight - estimatedHeight * 0.1;

    const grayPercent = this.bubble.getOldNeutAmount() * 100 / this.bubble.getOldNewsAmount();
    const grayHeight = nameH * 10 * 0.6 * grayPercent / 100;
    const grayDiff = estimatedHeight - grayHeight - estimatedHeight * 0.1;

    const redPercent = this.bubble.getOldNegAmount() * 100 / this.bubble.getOldNewsAmount();
    const redHeight = nameH * 10 * 0.6 * redPercent / 100;
    const redDiff = estimatedHeight - redHeight - estimatedHeight * 0.1;

    Focus.focus(this.bubble, () => {
      if (!this.bubble.isReferencesSpawned()) {
        ZoomConfig.zoomDisabled = true;

        if (!this.bubble.isReferencesLoaded()) {
          this.bubble.startRotating();
        }
      }

      this.bubble.spawnReferences();
    });

    const fontSize = this.bubble.scaleDown(BubbleConfig.FONT_SIZE);
    const averageText = this.bubble
      .getGroup()
      .insert('text', '#statistics-' + this.bubble.getId() + ' + *')
      .classed('stats', true)
      .attr('x', initRectX)
      .attr('y', initRectY + fontSize * 1.5)
      .attr('font-size', fontSize)
      .attr('font-weight', 'bold')
      .style('opacity', 0)
      .text('Average score')
      .transition()
      .duration(750)
      .style('opacity', 1);

    const amountText = this.bubble
      .getGroup()
      .insert('text', '#statistics-' + this.bubble.getId() + ' + *')
      .classed('stats', true)
      .attr('x', initRectX)
      .attr('y', initRectY + fontSize * 2.5)
      .attr('font-size', fontSize / 1.5)
      .style('opacity', 0)
      .text('This month | ' + this.bubble.getOldNewsAmount() + ' News')
      .transition()
      .duration(750)
      .style('opacity', 1);

    averageText
      .attr('x', function() {
        const element = d3.select(this);
        return initRectX
          + (selection.node() as SVGGraphicsElement).getBBox().width / 2
          - (element.node().getBBox().width / 2);
      });

    amountText
      .attr('x', function() {
        const element = d3.select(this);
        return initRectX
          + (selection.node() as SVGGraphicsElement).getBBox().width / 2
          - (element.node().getBBox().width / 2);
      });

    selection.transition()
      .duration(750)
      .attr('height', estimatedHeight)
      .on('end', () => {
        const x = this.bubble.getCenterX() - nameW / 2 - statisticsButtonWidth * 1.5 / 2;
        const y = this.bubble.getCenterY() + (this.bubble.getRadius() * 1.5) + nameH + (nameH * 0.2);

        this.spawnStatsRect(
          x,
          y,
          1,
          width,
          greenDiff,
          greenHeight,
          estimatedHeight,
          greenPercent,
          BubbleSegmentColor.GREEN
        );

        this.spawnStatsRect(
          x,
          y,
          2,
          width,
          grayDiff,
          grayHeight,
          estimatedHeight,
          grayPercent,
          'lightgray'
        );

        this.spawnStatsRect(
          x,
          y,
          3,
          width,
          redDiff,
          redHeight,
          estimatedHeight,
          redPercent,
          BubbleSegmentColor.RED
        );
      });
  }

  private spawnStatsRect(x, y, index, width, diff, height, fullHeight, percent, color) {
    const fontSize = this.bubble.scaleDown(BubbleConfig.FONT_SIZE);
    const statsWidth = width / 5 * 0.8;

    const rectX = x + width / 5 * index + width / 5 * 0.1;
    const corner = this.bubble.scaleDown(BubbleConfig.NAMETAG_CORNER_ROUND);
    const rect = this.bubble
      .getGroup()
      .insert('rect', '#statistics-' + this.bubble.getId() + ' + *')
      .attr('id', 'green-stat')
      .classed('stats', true)
      .attr('rx', corner)
      .attr('ry', corner)
      .attr('x', rectX)
      .attr('y', y + diff)
      .attr('width', statsWidth)
      .attr('height', 0)
      .attr('fill', color)
      .transition()
      .duration(500)
      .attr('height', height + this.bubble.scaleDown(1));

    const statText = this.bubble
      .getGroup()
      .insert('text', '#green-stat + *')
      .classed('stats', true)
      .attr('x', rectX)
      .attr('y', y + diff - fullHeight * 0.05)
      .attr('font-size', fontSize)
      .style('opacity', 0)
      .text(Math.round(percent) + '%');

    statText
      .attr('x', function() {
        const element = d3.select(this);
        return rectX
          + (rect.node().getBBox().width / 2)
          - (element.node().getBBox().width / 2);
      })
      .transition()
      .duration(750)
      .style('opacity', 1);
  }
}
