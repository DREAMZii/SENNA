import {Component, ViewChild, ElementRef, AfterContentInit} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble.entity';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterContentInit {
  @ViewChild('graphContainer') graphContainer: ElementRef;

  constructor() {}

  ngAfterContentInit() {
    const bubbleCenter = new Bubble(3, 3, 3, 75);
    bubbleCenter.spawn();

    const bubbleLeft = new Bubble(5, 2, 1, 50);
    bubbleLeft.spawn(150, 300);

    Bubble.connect(bubbleCenter, bubbleLeft);
  }
}
