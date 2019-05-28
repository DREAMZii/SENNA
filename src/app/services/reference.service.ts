import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(
    private http: HttpClient
  ) {
  }

  async getReferences(searchTerm: string, amount = 4) {
    const uri = 'https://bing.com/search?q=Kion+Group';
    const params = new HttpParams()
      .set('searchTerm', searchTerm);

    const response = await this.http.get(uri, {responseType: 'text'});
    console.log('AMK');
    let mappedResponse = [];
    await response.subscribe((response) => {
      console.log(response);
    });

    return mappedResponse;
  }

  /*async getReferences(searchTerm: string, amount = 4) {
    const uri = environment.references.url;
    const params = new HttpParams()
      .set('searchTerm', searchTerm);

    const response = await this.http.get(uri, {params: params});
    let mappedResponse = [];
    await response.toPromise().then((references) => {
      mappedResponse = (references['searchReferences'] as string[]);
      mappedResponse = mappedResponse.slice(
        0,
        mappedResponse.length > amount ?
          amount : mappedResponse.length
      );
    });

    return mappedResponse;
  }*/

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
