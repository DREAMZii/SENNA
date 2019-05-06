import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import {SENNA_ALERT_TYPES} from 'src/app/core/modules/senna-alert/senna-alert.enum';

@Injectable({ providedIn: 'root' })
export class SennaAlertService {
    private subject = new Subject<any>();
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
                    this.subject.next();
                }
            }
        });
    }

    async success(message: string, messageDuratinMs = 3000) {
      await this.showMessage(message, SENNA_ALERT_TYPES.SUCCESS, messageDuratinMs);
    }

    async error(message: string, messageDuratinMs = 3000) {
        await this.showMessage(message, SENNA_ALERT_TYPES.ERROR, messageDuratinMs);
    }

  private async showMessage(message: string, messageType = SENNA_ALERT_TYPES.ERROR, messageDuratinMs = 3000) {
      this.keepAfterNavigationChange = messageDuratinMs === 0;
      this.subject.next({ type: messageType, text: message });

      if (!this.keepAfterNavigationChange) {
        await new Promise(resolve => setTimeout(() => resolve(), messageDuratinMs)).then(() => this.reset());
      }
  }

  reset() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
        return this.subject.asObservable();
  }
}
