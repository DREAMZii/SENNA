import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';
import {ConfigService, ReferenceService} from '@app/services';

import {CacheUtil} from '@app/core/util/cache.util';
import {ActivatedRoute, Router} from '@angular/router';

import * as d3 from 'd3';
import {NewsUtil} from '@app/core/util/news.util';
import {BubbleUtil} from '@app/core/util/bubble.util';
import {environment} from '@environments/environment.prod';

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

  private searchTerm = '';

  ngOnInit() {
    this.searchTerm = this.route.snapshot.paramMap.get('q');
    const localeParam = this.route.snapshot.queryParamMap.get('l');

    if (this.searchTerm === '') {
      this.router.navigate(['/']);
    }

    const allowedLocales = ['de-DE', 'en-US'];
    if (localeParam !== '' && allowedLocales.indexOf(localeParam) >= 0) {
      NewsUtil.locale = localeParam;
      NewsUtil.languageCode = localeParam.split('-')[0];
    }

    if (this.searchTerm.toLowerCase().startsWith('kion')) {
      this.searchTerm = 'Kion Group';
    }

    this.markLanguageButton();
    this.initButtonEvents();

    this.configService.fetch(() => {
      CacheUtil.getNews(this.searchTerm).then((news) => {
        this.referenceService.getImage(this.searchTerm).then((imageUrl) => {
          // TODO: Fix this
          /* tslint:disable */
          new Bubble(this.searchTerm, imageUrl, news);
          /* tslint:enable */

          this.initSvgEvents();
        });
      });
    });
  }

  markLanguageButton() {
    if (NewsUtil.languageCode === 'en') {
      d3.select('#english-button')
        .attr('xlink:href', 'assets/images/en_active.svg');

      d3.select('#german-button')
        .attr('xlink:href', 'assets/images/de_inactive_.svg');
    } else {
      d3.select('#german-button')
        .attr('xlink:href', 'assets/images/de_active.svg');

      d3.select('#english-button')
        .attr('xlink:href', 'assets/images/en_inactive.svg');
    }
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
    d3.select('#german-button')
      .on('click', () => {
        if (NewsUtil.locale === 'de-DE') {
          return;
        }

        window.open(environment.url + '/search/' + this.searchTerm + '?l=de-DE', '_self');
      });

    d3.select('#english-button')
      .on('click', () => {
        if (NewsUtil.locale === 'en-US') {
          return;
        }

        window.open(environment.url + '/search/' + this.searchTerm + '?l=en-US', '_self');
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
        // Focus origin bubble
        BubbleUtil.focusBubble(BubbleUtil.bubbles[0]);
      });

    d3.select('#search-button')
      .on('click', () => {
        window.open(environment.url + '?open=true', '_self');
      });
  }
}
