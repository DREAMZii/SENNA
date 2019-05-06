import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncSubject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private azCognitiveServiceKey: string;
  private subject = new AsyncSubject<ConfigService>();

  constructor(
    private http: HttpClient
  ) {}

  fetch(callback) {
    console.log('#### ConfigService fetching azure service api key');
    this.http.get(`${environment.config.url}`).subscribe(value => {
      console.log('#### ConfigService subscribe called');
      this.azCognitiveServiceKey = value['cognitiveServiceApiKey'];
      this.subject.next(this);
      this.subject.complete();

      console.log('### ConfigService done. Using callback.');
      callback();
    }, error => {
      console.log('#### ConfigService error called');
      this.subject.error(error);
    });
  }

  isConfigInitialized(): AsyncSubject<ConfigService> {
    return this.subject;
  }

  getAzCognitiveServiceKey(): string {
    console.log('ConfigService getAzCognitiveServiceKey called', this.azCognitiveServiceKey);
    return this.azCognitiveServiceKey;
  }
}
