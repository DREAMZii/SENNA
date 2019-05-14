import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';


@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(
    private configService: ConfigService,
    private http: HttpClient
  ) {
  }

  async getReferences(searchTerm: string) {
    const uri = environment.references.url;
    const params = new HttpParams()
      .set('searchTerm', searchTerm);

    const response = await this.http.get(uri, {params: params});
    let mappedResponse = [];
    await response.toPromise().then((references) => {
      mappedResponse = references['searchReferences'];
    });

    return mappedResponse;
  }
}
