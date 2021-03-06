import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.css']
})
export class SentimentComponent implements OnInit {
  constructor(
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.initClickEvents();

    if (this.route.snapshot.queryParamMap.get('open') === 'true') {
      const button = d3.select('#first-search-button');
      const buttonField = d3.select('#search-extend');

      buttonField.style('height', '7.5vh');
      buttonField.style('width', '58vh');
      button.style('left', '50vh').classed('open', true);
    }
  }

  initClickEvents() {
    d3.select('#first-search-button')
      .on('click', function() {
        const button = d3.select(this);
        if (button.classed('open')) {
          // Submit form if already open
          (d3.select('#search-form-submit').node() as HTMLElement).click();
          return;
        }

        const buttonField = d3.select('#search-extend');

        buttonField.style('height', '7.5vh');
        buttonField.transition()
          .duration(500)
          .style('width', '58vh');

        button.transition()
          .duration(500)
          .style('left', '50vh')
          .on('end', () => {
            button.classed('open', true);
          });
      });
  }
}
