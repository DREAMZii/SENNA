import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';
import {ConfigService} from '@app/services';

import {CacheUtil} from "@app/core/util/cache.util";
import {ActivatedRoute, Router} from "@angular/router";

import * as d3 from 'd3';
import {NewsUtil} from "@app/core/util/news.util";

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('graphContainer') graphContainer: ElementRef;

  constructor(
    private configService: ConfigService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    const searchTerm = this.route.snapshot.paramMap.get('q');

    if (searchTerm === '') {
      this.router.navigate(['/']);
    }

    this.configService.fetch(() => {
      CacheUtil.getNews(searchTerm).then((news) => {
        const bubble = new Bubble(searchTerm, news);
        bubble.spawn();

        this.initSvgEvents();
      });
    });
  }

  initSvgEvents() {
    d3.select('app-senna-news')
      .append('div')
      .attr('id', 'open-news-article')
      .style('width', '3.5%')
      .style('float', 'right');

    d3.select('#canvas')
      .on('click', function() {
        if (d3.event.srcElement.tagName !== 'svg') {
          return;
        }

        NewsUtil.closeNews();
      });
  }
}
