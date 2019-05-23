import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {News} from '@app/core/entities/news.entity';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(
    private http: HttpClient
  ) {
  }

  public async isEmbedabble(news: News) {
    const uri = news.getUrl();
    return await this.http.get(uri, {responseType: 'text', observe: 'response'});
  }
}
