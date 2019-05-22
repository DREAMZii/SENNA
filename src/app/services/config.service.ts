import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { AsyncSubject } from 'rxjs';
import { environment } from '@environments/environment';
import {HTTP_HEADER_AUTHORIZATION} from '@app/core/constants/http.constants';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private azCognitiveServiceKey: string;
  private subject = new AsyncSubject<ConfigService>();

  constructor(
    private http: HttpClient
  ) {}

  fetch(callback) {
    this.http.get(`${environment.config.url}`).subscribe((value) => {
      this.azCognitiveServiceKey = value['cognitiveServiceApiKey'];
      this.subject.next(this);
      this.subject.complete();

      callback();
    }, error => {
      this.subject.error(error);
    });
  }

  isConfigInitialized(): AsyncSubject<ConfigService> {
    return this.subject;
  }

  getAzCognitiveServiceKey(): string {
    return this.azCognitiveServiceKey;
  }
}
