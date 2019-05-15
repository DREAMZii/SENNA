import {Component, OnInit} from '@angular/core';

import * as d3 from 'd3';
import {NewsUtil} from "@app/core/util/news.util";

@Component({
  selector: 'app-senna-news',
  templateUrl: 'senna-news.component.html',
  styleUrls: ['senna-news.component.css']
})
export class SennaNewsComponent implements OnInit {
  ngOnInit() {
    // Init events
    d3.select('#close-button')
      .on('click', () => {
        NewsUtil.removeActiveNews();
      });
  }
}
