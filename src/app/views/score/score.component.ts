import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ActivatedRoute} from '@angular/router';
import {environment} from '@environments/environment.prod';
import {SennaAlertService} from '@app/core/modules/senna-alert/senna-alert.service';
import {AzureService, ConfigService} from '@app/services';
import {CircleUtil} from '@app/core/util/circle.util';
import {News} from '@app/core/entities/news/news.entity';
import {BubbleSegmentColor} from '@app/core/entities/bubble/components/bubble.segment';
import {NewsConfig} from '@app/core/config/news.config';

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
        d3.select('#word-facts')
          .append('p')
          .html('<strong>Detected Language</strong>: ' + locale);

        this.azureService.determineSentiment(this.searchTerm, locale).then((score) => {
          d3.select('#loading-gear').remove();
          d3.select('#initial-words').text(this.searchTerm);

          const roundedScore = Math.round(score * 100);

          const intervalTime = 1000 / roundedScore;
          const counterTime = roundedScore * intervalTime;

          let color = 'black';
          if (score >= NewsConfig.POSITIVE_THRESHHOLD) {
            color = BubbleSegmentColor.GREEN;
          } else if (score > NewsConfig.NEGATIVE_THRESHHOLD && score < NewsConfig.POSITIVE_THRESHHOLD) {
            color = BubbleSegmentColor.GRAY;
          } else {
            color = BubbleSegmentColor.RED;
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
        window.open(environment.url + '/score' + '?open=true', '_self');
      });
  }
}
