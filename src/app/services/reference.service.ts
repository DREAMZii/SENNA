import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';
import {
  HTTP_HEADER_AUTHORIZATION
} from '@app/core/constants/http.constants';


@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(
    private configService: ConfigService,
    private http: HttpClient
  ) {
  }

  private headersJson() {
    return {
      [HTTP_HEADER_AUTHORIZATION]: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhCeGw5bUFlNmd4YXZDa2NvT1UyVEhzRE5hMCIsImtpZCI6IkhCeGw5bUFlNmd4YXZDa2NvT1UyVEhzRE5hMCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8xM2M3MjhlMC1iYjBjLTRjZjctOGUxMC01YjMyNzI3OWQ2ZDkvIiwiaWF0IjoxNTU3NzU4OTcxLCJuYmYiOjE1NTc3NTg5NzEsImV4cCI6MTU1Nzc2Mjg3MSwiYWNyIjoiMSIsImFpbyI6IjQyWmdZUGl4bWNXb2FPdldYWEsyVmZ1MFpwaCthYkY5UEgrN2QxbUs0b0hBWFZYdm80b0IiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiYzQ0YjQwODMtM2JiMC00OWMxLWI0N2QtOTc0ZTUzY2JkZjNjIiwiYXBwaWRhY3IiOiIyIiwiZmFtaWx5X25hbWUiOiJEb2xsbWFubiIsImdpdmVuX25hbWUiOiJUaW0iLCJncm91cHMiOlsiY2U5ZGE2MzgtOTQ0NC00OTBjLTkyN2ItZDRlZjZhOGU4ZDM2IiwiMDQ2ZmI2YmMtOTRjNC00ODYzLTljYmItZDQwNTQ2ZTllMTk3IiwiOWZjZWJjOWQtZDQxMS00YmJiLTkzZDYtZDQxYTM4MTliNWMwIiwiZDY2ZWIxNWEtNjhmMy00N2RlLWJlOTgtMWM5MGI2N2UxYTVmIl0sImlwYWRkciI6IjgwLjE0OS42OC41MCIsIm5hbWUiOiJEb2xsbWFubiwgVGltIiwib2lkIjoiNTk2NDdkNjgtZDZmMi00NGYxLWEzMmQtZmJlNWMwMTQwMGQ0Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxOTU3MzQ0LTEyNjAyMjEwNTItMTE1OTQyMjIyNS0zMjgyOTEiLCJwdWlkIjoiMTAwMzIwMDA0M0U0MEM5QSIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6ImF4M1NBWExUcWYxR0l1RmNyTmNDRXlKU2xmV1JYSWJ1UGp4WVNoMFY1RkkiLCJ0aWQiOiIxM2M3MjhlMC1iYjBjLTRjZjctOGUxMC01YjMyNzI3OWQ2ZDkiLCJ1bmlxdWVfbmFtZSI6InRpbS5kb2xsbWFubkBraW9uZ3JvdXAuY29tIiwidXBuIjoidGltLmRvbGxtYW5uQGtpb25ncm91cC5jb20iLCJ1dGkiOiJBUHVMSktHVFJVcTJ3dEQzTXlaekFBIiwidmVyIjoiMS4wIn0.NtcoeC-cJD-KPyLkEl3ZUZEtG7UdizMvRv1V1TLWsI0ivXWCYwUAQ_qKozJQwhqPJSs6iMiUe8ilY25dEfXxTQNxOAVXAdG-wlSsKcU4Z8zKX4ntkdK0m-yn_z6vxY7u0ZrAPgYDfJ6w8w8Mt0Mk-olJUi86RmjjnFuoE_nF_ThGs6Fv6KJ_r1asx9sm44eabxVGTEHJxYqjl7cAYmfSooTpYn_Hv9oDi372Su9a2iswem1ThyOLSNHyqtWCw8dDAJiH5P3uFs6jp1TvlAMwwW59hqWtmfTVZZzgJ6hZ8G-H1wn9t12COP8cH5_vGh4ygz4qvEelWsim3KuH4aI2hg'
    };
  }

  async getReferences(searchTerm: string) {
    const uri = environment.references.url;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('searchTerm', searchTerm);

    const response = await this.http.get(uri, {headers: headers, params: params});
    let mappedResponse = [];
    await response.toPromise().then((references) => {
      mappedResponse = references['searchReferences'];
    });

    return mappedResponse;
  }
}
