import {Component, OnInit} from '@angular/core';
import {CustomAdalService} from '@app/services';

@Component({
  selector: 'app-senna-header',
  templateUrl: 'senna-header.component.html',
  styleUrls: ['senna-header.component.css']
})
export class SennaHeaderComponent implements OnInit {

  constructor(
    private adalService: CustomAdalService,
  ) {

  }

  ngOnInit() {
    this.adalService.handleWindowCallback();
  }

  logout() {
    this.adalService.logOut();
  }

  isNavbarVisible() {
    return this.adalService.isAuthenticated();
  }

}
