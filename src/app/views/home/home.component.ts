import {Component, ViewChild, ElementRef, AfterContentInit} from '@angular/core';
import { BubbleService } from '@app/services/bubble.service';
import * as d3 from 'd3';
import {promise} from 'selenium-webdriver';
import delayed = promise.delayed;
import {delay} from 'rxjs/operators';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterContentInit {
  @ViewChild('graphContainer') graphContainer: ElementRef;

  constructor(private bubbleService: BubbleService) {}

  ngAfterContentInit() {
    const svg = this.bubbleService.spawnCircle(3, 3, 3);
    this.bubbleService.spawnCircle(10, 4, 3, 50, 150, 300);

    // Calculate angle between 2 middle points
    const xDiff = 150 - svg.node().getBoundingClientRect().width / 2;
    const yDiff = 300 - svg.node().getBoundingClientRect().height / 2;
    const angleInRad1 = Math.atan2(yDiff, xDiff);

    const xDiff2 = svg.node().getBoundingClientRect().width / 2 - 150;
    const yDiff2 = svg.node().getBoundingClientRect().height / 2 - 300;
    const angleInRad2 = Math.atan2(yDiff2, xDiff2);


    // Find point on circle relative to calculated angle
    const x1 = svg.node().getBoundingClientRect().width / 2 + 50 * Math.cos(angleInRad1);
    const y1 = svg.node().getBoundingClientRect().height / 2 + 50 * Math.sin(angleInRad1);

    // Find point on circle 2
    const x2 = 150 + 50 * Math.cos(angleInRad2);
    const y2 = 300 + 50 * Math.sin(angleInRad2);

    // Append line with calculated endpoints
    svg.append("line")          // attach a line
      .style("stroke", "black")  // colour the line
      .attr("x1", x1)     // x position of the first end of the line
      .attr("y1", y1)      // y position of the first end of the line
      .attr("x2", x2)     // x position of the second end of the line
      .attr("y2", y2);    // y position of the second end of the line
  }
}
