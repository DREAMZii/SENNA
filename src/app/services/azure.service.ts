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

  async searchNews(query: string) {
    const uri = environment.azure.cognitiveServices.newsSearchUrl;
    const headers = new HttpHeaders(this.headersJson());
    const params = new HttpParams()
      .set('q', query)
      .set('count', '7')
      .set('offset', '0')
      .set('mkt', 'de-DE')
      .set('sortBy', 'date');

    const response = await this.http.get(uri, {headers: headers, params: params});

    const newsEntities = [];
    await response.toPromise().then((news) => {
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
      data['datePublished']
    );
  }

  async determineNewsSentiment(news: News[]) {
    const texts = [];
    for (const single of news) {
      texts.push(single.getName());
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

  private mappingFunction(currentValue: string, index: number) {
    return {
      'language': 'de',
      'id': index + 1,
      'text': currentValue
    };
  }
}
