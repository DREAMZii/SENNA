import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ActivatedRoute} from '@angular/router';
import {environment} from '@environments/environment.prod';
import {SennaAlertService} from '@app/core/modules/senna-alert/senna-alert.service';
import {AzureService, ConfigService} from '@app/services';
import {News} from '@app/core/entities/news.entity';
import {NewsUtil} from "@app/core/util/news.util";

@Component({
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private alertService: SennaAlertService,
    private azureService: AzureService) {

  }

  private searchTerm = '';

  ngOnInit() {
    this.searchTerm = this.route.snapshot.queryParamMap.get('q');
    const localeParam = this.route.snapshot.queryParamMap.get('l');

    console.log(NewsUtil.locale);

    if (this.searchTerm === null || this.searchTerm === '') {
      this.alertService.error('SearchTerm cannot be empty!');
      return;
    }

    const allowedLocales = ['de-DE', 'en-US'];
    if (localeParam !== '' && allowedLocales.indexOf(localeParam) >= 0) {
      NewsUtil.locale = localeParam;
      NewsUtil.languageCode = localeParam.split('-')[0];
    }

    this.searchTerm = decodeURIComponent(this.searchTerm);

    this.initClickEvents();
    this.markLanguageButton();

    this.configService.fetch(() => {
      this.azureService.determineSentiment(this.searchTerm).then((score) => {
        d3.select('#loading-gear').remove();

        const roundedScore = Math.round(score * 100);

        let counter = 0;
        const tid = setInterval(() => {
          d3.select('#score-counter')
            .text(counter + '%');

          if (counter >= roundedScore) {
            clearInterval(tid);
          }

          counter++;
        }, 1000 / roundedScore);
      });
    });
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
    d3.select('#search-button')
      .on('click', () => {
        window.open(environment.url + '/sentiment' + '?open=true', '_self');
      });

    d3.select('#german-button')
      .on('click', () => {
        if (NewsUtil.locale === 'de-DE') {
          return;
        }

        window.open(environment.url + '/score?q=' + encodeURIComponent(this.searchTerm) + '&l=de-DE', '_self');
      });

    d3.select('#english-button')
      .on('click', () => {
        if (NewsUtil.locale === 'en-US') {
          return;
        }

        window.open(environment.url + '/score?q=' + encodeURIComponent(this.searchTerm) + '&l=en-US', '_self');
      });
  }
}
