import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ActivatedRoute, Router} from '@angular/router';
import {NewsUtil} from '@app/core/util/news.util';
import {environment} from '@environments/environment.prod';

@Component({
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.css']
})
export class SentimentComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.initClickEvents();
    const localeParam = this.route.snapshot.queryParamMap.get('l');

    const allowedLocales = ['de-DE', 'en-US'];
    if (localeParam !== '' && allowedLocales.indexOf(localeParam) >= 0) {
      NewsUtil.locale = localeParam;
      NewsUtil.languageCode = localeParam.split('-')[0];
    }

    this.markLanguageButton();

    if (this.route.snapshot.queryParamMap.get('open') === 'true') {
      const button = d3.select('#first-search-button');
      const buttonField = d3.select('#search-extend');

      buttonField.style('height', '7.5vh');
      buttonField.style('width', '58vh');
      button.style('left', '50vh').classed('open', true);
    }
  }

  markLanguageButton() {
    if (NewsUtil.languageCode === 'en') {
      d3.select('#english-button')
        .attr('src', 'assets/images/en_active.svg');

      d3.select('#german-button')
        .attr('src', 'assets/images/de_inactive_.svg');
    } else {
      d3.select('#german-button')
        .attr('src', 'assets/images/de_active.svg');

      d3.select('#english-button')
        .attr('src', 'assets/images/en_inactive.svg');
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

    d3.select('#german-button')
      .on('click', () => {
        if (NewsUtil.locale === 'de-DE') {
          return;
        }

        NewsUtil.locale = 'de-DE';
        NewsUtil.languageCode = 'de';
        this.markLanguageButton();
      });

    d3.select('#english-button')
      .on('click', () => {
        if (NewsUtil.locale === 'en-US') {
          return;
        }

        NewsUtil.locale = 'en-US';
        NewsUtil.languageCode = 'en';
        this.markLanguageButton();
      });
  }
}
