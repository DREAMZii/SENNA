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
      const bubbleCenter = new Bubble(3, 3, 3, 75);
      bubbleCenter.spawn();

      const bubbleLeft = new Bubble(5, 2, 1, 50);
      bubbleLeft.spawn(150, 300);

      Bubble.connect(bubbleCenter, bubbleLeft);

      this.azureService.searchNews('kion').subscribe(data => {

      });
    });
  }
}
