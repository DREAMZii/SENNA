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
      [HTTP_HEADER_AUTHORIZATION]: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkhCeGw5bUFlNmd4YXZDa2NvT1UyVEhzRE5hMCIsImtpZCI6IkhCeGw5bUFlNmd4YXZDa2NvT1UyVEhzRE5hMCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8xM2M3MjhlMC1iYjBjLTRjZjctOGUxMC01YjMyNzI3OWQ2ZDkvIiwiaWF0IjoxNTU3Mzg5NjM1LCJuYmYiOjE1NTczODk2MzUsImV4cCI6MTU1NzM5MzUzNSwiYWNyIjoiMSIsImFpbyI6IjQyWmdZSmk1OHFOazBVTk9MZFh6eXhhWDFIWGN0NmxMTWIrV0ZMS3pKYmpwL0NMV3lPc0EiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiYzQ0YjQwODMtM2JiMC00OWMxLWI0N2QtOTc0ZTUzY2JkZjNjIiwiYXBwaWRhY3IiOiIyIiwiZmFtaWx5X25hbWUiOiJEb2xsbWFubiIsImdpdmVuX25hbWUiOiJUaW0iLCJncm91cHMiOlsiY2U5ZGE2MzgtOTQ0NC00OTBjLTkyN2ItZDRlZjZhOGU4ZDM2IiwiMDQ2ZmI2YmMtOTRjNC00ODYzLTljYmItZDQwNTQ2ZTllMTk3IiwiOWZjZWJjOWQtZDQxMS00YmJiLTkzZDYtZDQxYTM4MTliNWMwIiwiZDY2ZWIxNWEtNjhmMy00N2RlLWJlOTgtMWM5MGI2N2UxYTVmIl0sImlwYWRkciI6IjgwLjE0OS42OC41MCIsIm5hbWUiOiJEb2xsbWFubiwgVGltIiwib2lkIjoiNTk2NDdkNjgtZDZmMi00NGYxLWEzMmQtZmJlNWMwMTQwMGQ0Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIxOTU3MzQ0LTEyNjAyMjEwNTItMTE1OTQyMjIyNS0zMjgyOTEiLCJwdWlkIjoiMTAwMzIwMDA0M0U0MEM5QSIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6ImF4M1NBWExUcWYxR0l1RmNyTmNDRXlKU2xmV1JYSWJ1UGp4WVNoMFY1RkkiLCJ0aWQiOiIxM2M3MjhlMC1iYjBjLTRjZjctOGUxMC01YjMyNzI3OWQ2ZDkiLCJ1bmlxdWVfbmFtZSI6InRpbS5kb2xsbWFubkBraW9uZ3JvdXAuY29tIiwidXBuIjoidGltLmRvbGxtYW5uQGtpb25ncm91cC5jb20iLCJ1dGkiOiJwLVEtMnJVcWJFLVl4ZXBjR1V5MEFBIiwidmVyIjoiMS4wIn0.mJrLIneeuaB3kXDUfoZfh3LyT-4CkzhX8EAPB3iCz3A_ssFKV12dSW9DN9NRYPlGlk7CU90WtyxnlT6E4n1a-KbB1pSQj62Z8_c0nK1dY98zvwD5qRK2cFtGfHbgLOIxTC7CyVsiJ8FP-gk7TVCdk3Yz-ugnrS90SJt8Oc0n6_KDrm8ubvtCbQ0e1-VFpMBG4rlSwKAWYyB6LdXzeVzIEOUt41-b7YxkL5QlRlE4bgzF-ndQbX_nuJr8_0zjoCI32Z8hqqWShPjur0mg4DrMA7uGQPS4N2CqDpm5pQjjooB1Zi1UZC7kvkHbokY1RAxztFs7ebuUwOoHoJ692ujQvw'
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
