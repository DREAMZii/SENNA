import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(
    private http: HttpClient
  ) {
  }

  /*async getImage(searchTerm: string, searchUrl = null) {
    let uri = environment.bing.searchUrl + '?q=' + searchTerm + '&cc=de';
    if (searchUrl !== null) {
      uri = environment.bing.url + searchUrl;
    }

    let imageUrl = '';
    await d3.html(uri).then((document) => {
      const imageElement = d3.select(document).select('.b_entityTP').select('img');

      if (imageElement.node() !== null) {
        const sourceLink = imageElement.attr('data-src-hq');

        if (sourceLink !== null) {
          if (sourceLink.startsWith('http')) {
            imageUrl = sourceLink;
          } else {
            imageUrl = environment.bing.url + sourceLink;
          }
        }
      }

      const alternativeElement = d3.select(document).select('.b_entityTP').select('.b_float_img');
      if (alternativeElement.node() !== null) {
        const sourceLink = alternativeElement.select('.rms_iac').attr('data-src');

        if (sourceLink !== null) {
          if (sourceLink.startsWith('http')) {
            imageUrl = sourceLink;
          } else {
            imageUrl = environment.bing.url + sourceLink;
          }
        }
      }
    });

    return imageUrl;
  }*/

  /*async getReferences(searchTerm: string, amount = 4, searchUrl = null) {
    let uri = environment.bing.searchUrl + '?q=' + searchTerm + '&cc=de';
    if (searchUrl !== null) {
      uri = environment.bing.url + searchUrl;
    }

    let carouselLink = '';
    let references = [];
    await d3.html(uri).then((document) => {
      const buttons = d3.select(document)
        .select('.b_entityTP')
        .selectAll('.b_moreLink').nodes();
      const moreButton = buttons[buttons.length - 1];

      if (moreButton !== undefined) {
        carouselLink = d3.select(moreButton).attr('href');
      }
    });

    if (carouselLink !== '') {
      references = await this.getCarouselReferences(carouselLink, amount);
    } else {
      references = this.getInitialReferences(document, amount);
    }

    return references;
  }

  private async getCarouselReferences(carouselLink: string, amount) {
    const uri = environment.bing.url + carouselLink + '&cc=de';
    const references = [];
    await d3.html(uri).then((plainDocument) => {
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
            referenceImageUrl: imageUrl,
            referenceUrl: element.attr('href')
          }
        );
      });
    });

    return references.slice(0, amount);
  }

  private getInitialReferences(document, amount) {
    const references = [];
    const modules = d3.select(document)
      .select('.b_entityTP:first-of-type')
      .selectAll('.b_subModule')
      .nodes();
    const imageSelection = d3.select(modules[modules.length - 1]).selectAll('.rms_iac');

    imageSelection.each(function() {
      const element = d3.select(this);
      let imageUrl = '';
      if (element.node() !== null) {
        imageUrl = environment.bing.url + element.attr('data-src');
      }

      references.push(
        {
          referenceTitle: element.attr('data-title'),
          referenceImageUrl: imageUrl,
          referenceUrl: element.attr('data-href')
        }
      );
    });

    return references.slice(0, amount);
  }*/

  async getReferences(searchTerm: string, amount = 4, searchUrl = null) {
    let uri = environment.references.url + '?searchTerm=' + searchTerm;

    if (searchUrl !== null) {
      uri += '&searchUrl=?' + encodeURI(searchUrl.split('?')[1]).replace(/&/g, '%26');
    }

    const response = await this.http.get(uri);
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
