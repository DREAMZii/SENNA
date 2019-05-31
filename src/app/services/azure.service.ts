import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';
import {
  HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME
} from '@app/core/constants/http.constants';
import {News} from '@app/core/entities/news.entity';
import {NewsUtil} from '@app/core/util/news.util';


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

  async searchNews(query: string) {
    const uri = environment.azure.cognitiveServices.newsSearchUrl;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('q', '+"' + query + '"')
      .set('count', '7')
      .set('offset', '0')
      .set('sortBy', 'date')
      .set('mkt', NewsUtil.locale)
      .set('freshness', 'week');

    const response = await this.http.get(uri, {headers: headers, params: params});

    const newsEntities = [];
    await response.toPromise().then(async (news) => {
      for (const single of news['value']) {
        newsEntities.push(
          this.buildNews(single)
        );
      }
    });

    return await this.determineNewsSentiment(newsEntities);
  }

  async searchOldNews(query: string) {
    const uri = environment.azure.cognitiveServices.newsSearchUrl;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('q', '+"' + query + '"')
      .set('count', '100')
      .set('offset', '0')
      .set('mkt', NewsUtil.locale);

    const response = await this.http.get(uri, {headers: headers, params: params});

    const newsEntities = [];
    await response.toPromise().then(async (news) => {
      for (const single of news['value']) {
        newsEntities.push(this.buildNews(single));
      }
    });

    return await this.determineNewsSentiment(newsEntities);
  }

  private buildNews(data): News {
    return new News(
      data['name'],
      data['description'],
      data['category'],
      data['url'],
      data['datePublished'].split('T')[0],
      data['provider'][0]['name']
    );
  }

  async determineLanguage(text: string) {
    const uri = environment.azure.cognitiveServices.textAnalysisLanguageUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : [text].map(this.languageMappingFunction) };

    const response = await this.http.post(uri, request, {headers: headers});
    let language = 'en';
    await response.toPromise().then((documents) => {
      language = documents['documents'][0]['detectedLanguages'][0]['iso6391Name'];
    });

    return language;
  }

  async determineSentiment(text: string, locale: string) {
    const uri = environment.azure.cognitiveServices.textAnalysisSentimentUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : [{
        'language': locale,
        'id': 1,
        'text': text
      }] };

    const response = await this.http.post(uri, request, {headers: headers});
    let score = 0.5;
    await response.toPromise().then((documents) => {
      score = documents['documents'][0]['score'];
    });

    return score;
  }

  async determineKeywords(text: string, locale: string) {
    const uri = environment.azure.cognitiveServices.textAnalysisKeyPhrasesUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : [{
        'language': locale,
        'id': 1,
        'text': text
      }] };

    const response = await this.http.post(uri, request, {headers: headers});
    let keyPhrases = [];
    await response.toPromise().then((documents) => {
      keyPhrases = documents['documents'][0]['keyPhrases'];
    });

    return keyPhrases;
  }

  async determineNewsSentiment(news: News[]) {
    const texts = [];
    for (const single of news) {
      texts.push(single.getName() + '. ' + single.getDescription());
    }

    if (texts.length <= 0) {
      return;
    }

    const uri = environment.azure.cognitiveServices.textAnalysisSentimentUrl;
    const headers = new HttpHeaders(this.headersJson());
    const request = { 'documents' : texts.map(this.mappingFunction) };

    const response = await this.http.post(uri, request, {headers: headers});
    await response.toPromise().then((documents) => {
      for (const sentiment of documents['documents']) {
        news[sentiment['id'] - 1].sentiment = sentiment['score'];
      }
    });

    return news;
  }

  private languageMappingFunction(currentValue: string, index: number) {
    return {
      'id': index + 1,
      'text': currentValue
    };
  }

  private mappingFunction(currentValue: string, index: number) {
    return {
      'language': NewsUtil.languageCode,
      'id': index + 1,
      'text': currentValue
    };
  }
}
