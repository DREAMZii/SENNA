import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {News} from '@app/core/entities/news.entity';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(
    private http: HttpClient
  ) {
  }

  async getNewsContent(news: News) {
    const uri = news.getUrl();

    const response = await this.http.get(uri, {responseType: 'text'});
    return await response.toPromise()
  }
}
