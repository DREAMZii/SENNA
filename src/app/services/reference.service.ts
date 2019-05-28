import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '@environments/environment';
import * as d3 from 'd3';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(
    private http: HttpClient
  ) {
  }

  async getReferences(searchTerm: string, amount = 4) {
    const uri = environment.bing.searchUrl + '?q=' + searchTerm;

    let carouselLink = '';
    await d3.html(uri).then((document) => {
      carouselLink = d3.select(document)
        .select('.b_entityTP:first-of-type .b_moreLink:last-of-type')
        .attr('href');
    });

    return await this.getCarouselReferences(carouselLink, amount);
  }

  private async getCarouselReferences(carouselLink: string, amount) {
    const references = [];
    await d3.html(environment.bing.url + carouselLink).then((plainDocument) => {
      const document =  d3.select(plainDocument);

      document.selectAll('.carousel-content a.cardToggle').each(function() {
        const element = d3.select(this);
        const image = element.select('img');
        let imageUrl = '';
        if (image.node() !== null) {
          imageUrl = environment.bing.url + image.attr('src');
        }

        references.push(
          {
            referenceTitle: element.attr('title'),
            referenceImageUrl: imageUrl
          }
        );
      });
    });

    return references.slice(
      0,
      references.length > amount ?
        amount : references.length
    );
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
