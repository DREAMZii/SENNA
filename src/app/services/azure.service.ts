import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';
import {
  HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME
} from '@app/core/constants/http.constants';


@Injectable({ providedIn: 'root' })
export class AzureService {
  constructor(
    private configService: ConfigService,
    private http: HttpClient
  ) {
  }

  private headersJson() {
    return {
      [HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME]: this.configService.getAzCognitiveServiceKey()
    };
  }

  searchNews(query: string) {
    const uri = environment.azure.cognitiveServices.newsSearchUrl;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('q', query)
      .set('count', '7')
      .set('offset', '0')
      .set('mkt', 'de-DE');

    return this.http.get(uri, {headers: headers, params: params});
  }

  search(query: string) {

    const uri = environment.azure.cognitiveServices.searchUrl;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('q', query)
      .set('count', '7')
      .set('offset', '0')
      .set('mkt', 'de-DE');

    return this.http.get(uri, {headers: headers, params: params});
  }

  determineKeyPhrases(texts: string[]) {

    const uri = environment.azure.cognitiveServices.textAnalysisKeyPhrasesUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : texts.map(this.mappingFunction) };
    console.log('request', request);
    return this.http.post(uri, request, {headers: headers});
  }

  determineSentiment(texts: string[]) {

    const uri = environment.azure.cognitiveServices.textAnalysisSentimentUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : texts.map(this.mappingFunction) };
    console.log('request', request);
    return this.http.post(uri, request, {headers: headers});
  }

  private mappingFunction(currentValue: string, index: number) {
    return {
      'language': 'de',
      'id': index + 1,
      'text': currentValue
    };
  }
}
