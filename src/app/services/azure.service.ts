import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';
import {
  HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME
} from '@app/core/constants/http.constants';
import {News} from '@app/core/entities/news.entity';


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

  searchNews(query: string, callback) {
    const uri = environment.azure.cognitiveServices.newsSearchUrl;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('q', query)
      .set('count', '7')
      .set('offset', '0')
      .set('mkt', 'de-DE');

    return this.http.get(uri, {headers: headers, params: params}).subscribe((response) => {
      const news = [];
      for (const newsJson of response['value']) {
        news.push(this.buildNews(newsJson));
      }

      this.determineNewsSentiment(news, callback);
    });
  }

  private buildNews(data): News {
    return new News(
      data['name'],
      data['description'],
      data['category'],
      data['url'],
      data['datePublished']
    );
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
    return this.http.post(uri, request, {headers: headers});
  }

  determineSentiment(texts: string[]) {
    const uri = environment.azure.cognitiveServices.textAnalysisSentimentUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : texts.map(this.mappingFunction) };

    return this.http.post(uri, request, {headers: headers});
  }

  determineNewsSentiment(news: News[], callback?) {
    const texts = [];
    for (const single of news) {
      texts.push(single.getName());
    }

    if (texts.length <= 0) {
      // Don't even try to request this
      if (callback !== null) {
        return callback(news);
      }
      return;
    }

    const uri = environment.azure.cognitiveServices.textAnalysisSentimentUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : texts.map(this.mappingFunction) };

    return this.http.post(uri, request, {headers: headers}).subscribe(response => {
      const sentiments = response['documents'];
      for (let i = 0; i < sentiments.length; i++) {
        news[i].sentiment = sentiments[i]['score'];
      }

      if (callback !== null) {
        callback(news);
      }
    });
  }

  private mappingFunction(currentValue: string, index: number) {
    return {
      'language': 'de',
      'id': index + 1,
      'text': currentValue
    };
  }
}
