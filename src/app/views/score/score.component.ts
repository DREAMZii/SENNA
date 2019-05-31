import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ActivatedRoute} from '@angular/router';
import {environment} from '@environments/environment.prod';
import {SennaAlertService} from '@app/core/modules/senna-alert/senna-alert.service';
import {AzureService, ConfigService} from '@app/services';
import {News} from '@app/core/entities/news.entity';
import {NewsUtil} from '@app/core/util/news.util';
import {BubbleUtil} from '@app/core/util/bubble.util';

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

    if (this.searchTerm === null || this.searchTerm === '') {
      this.alertService.error('SearchTerm cannot be empty!');
      return;
    }

    this.searchTerm = decodeURIComponent(this.searchTerm);

    this.initClickEvents();

    this.configService.fetch(() => {
      this.azureService.determineLanguage(this.searchTerm).then((locale) => {
        this.azureService.determineKeywords(this.searchTerm, locale).then((keyPhrases) => {
          d3.select('#word-facts')
            .append('p')
            .html('<strong>Keywords</strong>: ' + keyPhrases);

          d3.select('#word-facts')
            .append('p')
            .html('<strong>Language</strong>: ' + locale);
        });

        this.azureService.determineSentiment(this.searchTerm, locale).then((score) => {
          d3.select('#loading-gear').remove();
          d3.select('#initial-words').text(this.searchTerm);

          const roundedScore = Math.round(score * 100);

          const intervalTime = 1000 / roundedScore;
          const counterTime = roundedScore * intervalTime;

          let color = 'black';
          if (score >= BubbleUtil.positiveThreshhold) {
            color = BubbleUtil.greenColor;
          } else if (score > BubbleUtil.negativeThreshhold && score < BubbleUtil.positiveThreshhold) {
            color = BubbleUtil.grayColor;
          } else {
            color = BubbleUtil.redColor;
          }

          d3.select('#score-counter')
            .transition()
            .duration(counterTime)
            .style('color', color);

          let counter = 0;
          const tid = setInterval(() => {
            d3.select('#score-counter')
              .text(counter);

            if (counter >= roundedScore) {
              clearInterval(tid);
            }

            counter++;
          }, intervalTime);
        });
      });
    });
  }

  initClickEvents() {
    d3.select('#search-button')
      .on('click', () => {
        window.open(environment.url + '/sentiment' + '?open=true', '_self');
      });
  }
}
