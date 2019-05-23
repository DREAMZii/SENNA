import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import {SENNA_ALERT_TYPES} from 'src/app/core/modules/senna-alert/senna-alert.enum';
import * as d3 from 'd3';

@Injectable({ providedIn: 'root' })
export class SennaAlertService {
    private message: any;
    private keepAfterNavigationChange = false;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    d3.select('#alert-box')
                      .style('opacity', '0');
                }
            }
        });
    }

    success(message: string, messageDurationMs = 3000) {
      this.showMessage(message, SENNA_ALERT_TYPES.SUCCESS, messageDurationMs);
    }

    warning(message: string, messageDurationMs = 3000) {
      this.showMessage(message, SENNA_ALERT_TYPES.WARNING, messageDurationMs);
    }

    error(message: string, messageDurationMs = 3000) {
      this.showMessage(message, SENNA_ALERT_TYPES.ERROR, messageDurationMs);
    }

  private showMessage(message: string, messageType, messageDurationMs) {
      this.message = {message: message, messageType: messageType};
      const alertBox = d3.select('#alert-boxes')
        .append('div')
        .classed('alert-top', true)
        .classed('alert', true)
        .classed(messageType, true);


        alertBox.text(message)
          .style('opacity', '0')
          .transition()
          .duration(750)
          .style('opacity', '1');

      if (!this.keepAfterNavigationChange) {
        new Promise(resolve => setTimeout(() => resolve(), messageDurationMs))
          .then(() => this.reset(alertBox));
      }
  }

  reset(alertBox) {
      alertBox
        .transition()
        .duration(750)
        .style('opacity', '0')
        .on('end', () => {
          alertBox.remove();
        });
  }

  getMessage(): string {
      return this.message;
  }
}
