import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {ConfigService, ReferenceService} from '@app/services';

import {CacheUtil} from '@app/core/util/cache.util';
import {ActivatedRoute, Router} from '@angular/router';

import * as d3 from 'd3';
import {NewsUtil} from '@app/core/util/news.util';
import {BubbleUtil} from '@app/core/util/bubble.util';
import {environment} from '@environments/environment.prod';
import {Bubble} from "@app/core/entities/bubble/bubble.entity";
import {BubbleManager} from "@app/core/entities/bubble/bubble.manager";
import {Focus} from "@app/core/animations/focus.animation";
import {ZoomConfig} from "@app/core/config/zoom.config";

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private referenceService: ReferenceService
  ) {}

  ngOnInit() {
    let searchTerm = this.route.snapshot.paramMap.get('q');
    const localeParam = this.route.snapshot.queryParamMap.get('l');

    this.validateInputs(searchTerm, localeParam);

    // Cheat a bit
    if (searchTerm.toLowerCase().startsWith('kion')) {
      searchTerm = 'Kion Group';
    }

    // Validated
    this.markLanguageButton();
    this.initButtonEvents();
    this.initSvgEvents();

    this.configService.fetch(() => {
      CacheUtil.getNews(searchTerm).then((news) => {
        this.referenceService.getImage(searchTerm).then((imageUrl) => {
          // Azure Service Key + initial news + initial image loaded
          Bubble.createInitialBubble(searchTerm, imageUrl, news);
        });
      });
    });
  }

  /**
   * Validates required inputs
   *
   * @param searchTerm    - initial term that gets displayed, should not be empty
   * @param localeParam   - locale the news will get displayed in [de-DE, en-US]
   */
  validateInputs(searchTerm: string, localeParam: string) {
    const allowedLocales = ['de-DE', 'en-US'];
    if (localeParam !== '' && allowedLocales.indexOf(localeParam) >= 0) {
      NewsUtil.locale = localeParam;
      NewsUtil.languageCode = localeParam.split('-')[0];
    }

    if (searchTerm === '') {
      this.router.navigate(['/']);
    }
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
    d3.select('#canvas')
      .on('click', function() {
        if (d3.event.srcElement.tagName !== 'svg') {
          return;
        }

        NewsUtil.closeNews();
      });
  }

  initButtonEvents() {
    const urlSegments = this.route.snapshot.url.toString().replace(',', '/');

    d3.select('#german-button')
      .on('click', () => {
        if (NewsUtil.locale === 'de-DE') {
          return;
        }

        window.open(environment.url + urlSegments + '?l=de-DE', '_self');
      });

    d3.select('#english-button')
      .on('click', () => {
        if (NewsUtil.locale === 'en-US') {
          return;
        }

        window.open(environment.url + urlSegments + '?l=en-US', '_self');
      });

    d3.select('#back-button')
      .on('click', () => {
        const referrer = BubbleManager.getActiveBubble().getReferrer();

        if (referrer === null) {
          return;
        }

        Focus.focus(referrer);
      });

    d3.select('#center-button')
      .on('click', () => {
        if (ZoomConfig.zoomDisabled) {
          return;
        }

        // Focus origin bubble
        Focus.focus(BubbleManager.getInitialBubble());
      });

    d3.select('#search-button')
      .on('click', () => {
        window.open(environment.url + '?open=true', '_self');
      });
  }
}
