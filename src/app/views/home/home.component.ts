import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';
import {AzureService, ConfigService} from '@app/services';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('graphContainer') graphContainer: ElementRef;

  constructor(
    private configService: ConfigService,
    private azureService: AzureService
  ) {}

  ngOnInit() {
    this.configService.fetch(() => {
      this.azureService.searchNews('cpi technologies', (news) => {
        const bubble = new Bubble(news);
        bubble.spawn();

        console.log(bubble);
      });
    });
  }
}
