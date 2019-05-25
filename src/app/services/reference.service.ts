import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private static REFERENCE_COUNT = 4;

  constructor(
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
      mappedResponse = (references['searchReferences'] as string[]);
      mappedResponse = mappedResponse.slice(
        0,
        mappedResponse.length > ReferenceService.REFERENCE_COUNT ?
          ReferenceService.REFERENCE_COUNT : mappedResponse.length
      );
    });

    return mappedResponse;
  }

  async getImage(searchTerm: string) {
    const uri = environment.image.url;
    const params = new HttpParams()
      .set('searchTerm', searchTerm);

    const response = await this.http.get(uri, {params: params});
    let imageUrl = '';
    await response.toPromise().then((imageResult) => {
      imageUrl = imageResult['referenceImageUrl'];
    });

    return imageUrl;
  }
}
