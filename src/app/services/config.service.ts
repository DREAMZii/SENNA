import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AsyncSubject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private azCognitiveServiceKey: string;
  private subject = new AsyncSubject<ConfigService>();

  constructor(private http: HttpClient) {
    console.log('#### ConfigService constructor called');
    this.http.get(`${environment.config.url}`).subscribe(value => {
      console.log('#### ConfigService subscribe called');
      this.azCognitiveServiceKey = value['cognitiveServiceApiKey'];
      this.subject.next(this);
      this.subject.complete();
    }, error => {
      console.log('#### ConfigService error called');
      this.subject.error(error);
    });
  }

  async fetch(http: HttpClient): Promise<any> {
    return await http.get(`${environment.config.url}`).toPromise();
  }

  isConfigInitialized(): AsyncSubject<ConfigService> {
    return this.subject;
  }

  getAzCognitiveServiceKey(): string {
    console.log('ConfigService getAzCognitiveServiceKey called', this.azCognitiveServiceKey);
    return this.azCognitiveServiceKey;
  }
}
