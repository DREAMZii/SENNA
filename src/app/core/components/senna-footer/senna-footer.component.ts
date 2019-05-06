import {Component} from '@angular/core';

@Component({
  selector: 'app-senna-footer',
  templateUrl: 'senna-footer.component.html',
  styleUrls: ['senna-footer.component.css']
})
export class SennaFooterComponent {

  constructor() {
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

}
