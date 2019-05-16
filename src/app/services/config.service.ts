import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { AsyncSubject } from 'rxjs';
import { environment } from '@environments/environment';
import {HTTP_HEADER_AUTHORIZATION} from "@app/core/constants/http.constants";

@Injectable({ providedIn: 'root' })
export class ConfigService {

  private azCognitiveServiceKey: string;
  private subject = new AsyncSubject<ConfigService>();

  constructor(
    private http: HttpClient
  ) {}

  fetch(callback) {
    this.http.get(`${environment.config.url}`, {headers: new HttpHeaders().set('authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhCeGw5bUFlNmd4YXZDa2NvT1UyVEhzRE5hMCIsImtpZCI6IkhCeGw5bUFlNmd4YXZDa2NvT1UyVEhzRE5hMCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8xM2M3MjhlMC1iYjBjLTRjZjctOGUxMC01YjMyNzI3OWQ2ZDkvIiwiaWF0IjoxNTU3OTEzMzkyLCJuYmYiOjE1NTc5MTMzOTIsImV4cCI6MTU1NzkxNzI5MiwiYWNyIjoiMSIsImFpbyI6IjQyWmdZSml3b2ZtTHRzUkVwYnlqRjB4TWxUcGVlMjdTa3BZb2xIMTVYMFRDY3BQK3Myc0EiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiYzQ0YjQwODMtM2JiMC00OWMxLWI0N2QtOTc0ZTUzY2JkZjNjIiwiYXBwaWRhY3IiOiIyIiwiZmFtaWx5X25hbWUiOiJEb2xsbWFubiIsImdpdmVuX25hbWUiOiJUaW0iLCJncm91cHMiOlsiY2U5ZGE2MzgtOTQ0NC00OTBjLTkyN2ItZDRlZjZhOGU4ZDM2IiwiMDQ2ZmI2YmMtOTRjNC00ODYzLTljYmItZDQwNTQ2ZTllMTk3IiwiOWZjZWJjOWQtZDQxMS00YmJiLTkzZDYtZDQxYTM4MTliNWMwIiwiZDY2ZWIxNWEtNjhmMy00N2RlLWJlOTgtMWM5MGI2N2UxYTVmIl0sImlwYWRkciI6IjgwLjE0OS42OC41MCIsIm5hbWUiOiJEb2xsbWFubiwgVGltIiwib2lkIjoiNTk2NDdkNjgtZDZmMi00NGYxLWEzMmQtZmJlNWMwMTQwMGQ0Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxOTU3MzQ0LTEyNjAyMjEwNTItMTE1OTQyMjIyNS0zMjgyOTEiLCJwdWlkIjoiMTAwMzIwMDA0M0U0MEM5QSIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6ImF4M1NBWExUcWYxR0l1RmNyTmNDRXlKU2xmV1JYSWJ1UGp4WVNoMFY1RkkiLCJ0aWQiOiIxM2M3MjhlMC1iYjBjLTRjZjctOGUxMC01YjMyNzI3OWQ2ZDkiLCJ1bmlxdWVfbmFtZSI6InRpbS5kb2xsbWFubkBraW9uZ3JvdXAuY29tIiwidXBuIjoidGltLmRvbGxtYW5uQGtpb25ncm91cC5jb20iLCJ1dGkiOiJycGZfZHl3eEtVLUJrOFdsVmxiSkFBIiwidmVyIjoiMS4wIn0.RBXr_lfvTSbGKY9O0quDeNIGTsuHJJpuMPmFHZuj8JcinRjS-AEn7ZBEQ8kDWh6HkBPSkvy_AI4TE0aR79C2Wmel6KnLlJahtmlM8584FZaONr3HeH8dhFqfnJnH-0XOsirhFAfJ3Amb-ZXaWubEn547Bh8ZbLzfySLtgTyaN8A8igRdARA_8hccX0v-Jpd5lXTzSvR9xPhlR-jwBNu-r-ajD_9HrvpoRfPowCSuXc0ErWwhBSAGqSg0hFrCORqYnMHn-si3o7K-OLxpCgGx4_7RRZh53uwOgcukyKysWw1EkDGbskG1Yb6NL-5xuLOL8RE5UTg19HBzpTLZbhwn7w')}).subscribe(value => {
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
