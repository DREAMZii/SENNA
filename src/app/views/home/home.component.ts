import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';
import {AzureService, ConfigService} from '@app/services';

import * as d3 from 'd3';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('graphContainer') graphContainer: ElementRef;

  constructor(
    private configService: ConfigService,
    private azureService: AzureService
  ) {
  }

  ngOnInit() {
    this.configService.fetch(() => {
      d3.select('#graphContainer')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0);

      this.azureService.searchNews('kion', (news) => {
        const bubble = new Bubble(news);
        bubble.spawn();

        const bubble2 = new Bubble(news);
        bubble2.spawn(300, 300);

        // Bubble.connect(bubble, bubble2);
      });
    });
  }
}
