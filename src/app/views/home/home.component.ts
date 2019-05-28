import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';
import {ConfigService, ReferenceService} from '@app/services';

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
    private route: ActivatedRoute,
    private referenceService: ReferenceService
  ) {
  }

  ngOnInit() {
    let searchTerm = this.route.snapshot.paramMap.get('q');

    if (searchTerm === '') {
      this.router.navigate(['/']);
    }

    if (searchTerm.toLowerCase().startsWith('kion')) {
      searchTerm = 'Kion Group';
    }

    this.initButtonEvents();

    this.configService.fetch(() => {
      CacheUtil.getNews(searchTerm).then((news) => {
        this.referenceService.getImage(searchTerm).then((imageUrl) => {
          // TODO: Fix this
          /* tslint:disable */
          new Bubble(searchTerm, imageUrl, news);
          /* tslint:enable */

          this.initSvgEvents();
        });
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
        // Focus origin bubble
        BubbleUtil.focusBubble(BubbleUtil.bubbles[0]);
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
