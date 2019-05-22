import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';
import {ConfigService} from '@app/services';

import {CacheUtil} from '@app/core/util/cache.util';
import {ActivatedRoute, Router} from '@angular/router';

import * as d3 from 'd3';
import {NewsUtil} from '@app/core/util/news.util';
import {BubbleUtil} from '@app/core/util/bubble.util';

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

    this.initButtonEvents();

    this.configService.fetch(() => {
      CacheUtil.getNews(searchTerm).then((news) => {
        new Bubble(searchTerm, '', news);

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

  initButtonEvents() {
    d3.selectAll('.quick-button')
      .on('mouseenter', function() {
        const button = d3.select(this);

        button.transition()
          .attr('transform', 'scale(1.15)');
      })
      .on('mouseleave', function() {
        const button = d3.select(this);

        button.transition()
          .attr('transform', 'scale(1)');
      });

    d3.select('#back-button')
      .on('click', () => {
        const referrer = BubbleUtil.getActiveBubble().getReferrer();

        if (referrer === null) {
          return;
        }

        BubbleUtil.focusBubble(referrer);
      });

    d3.select('#center-button')
      .on('click', () => {
        BubbleUtil.focusBubble(BubbleUtil.getActiveBubble());
      });

    d3.select('#search-button')
      .on('click', () => {
        BubbleUtil.bubbles = [];
        BubbleUtil.bubblesByName = new Map();
        BubbleUtil.offsetX = 0;
        BubbleUtil.offsetY = 0;
        BubbleUtil.scale = 1;
        this.router.navigate(['/'], {queryParams: {open: 'true'}});
      });
  }
}
