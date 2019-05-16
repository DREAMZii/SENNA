import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  ngOnInit() {
    this.initClickEvents();
  }

  initClickEvents() {
    d3.select('#first-search-button')
      .on('click', function() {
        const button = d3.select(this);
        const buttonField = d3.select('#search-extend');

        buttonField.style('height', '7.5vh');
        buttonField.transition()
          .duration(500)
          .style('width', '37vh');

        button.transition()
          .duration(500)
          .style('left', '29vh');
      });
  }
}
