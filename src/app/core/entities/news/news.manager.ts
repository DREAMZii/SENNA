import {News} from '@app/core/entities/news/news.entity';

export class NewsManager {
  public static news = [];

  public static openArticles = new Map<number, News>();
  public static openNewsId: number;

  public static locale = 'en-US';
  public static languageCode = 'en';

  public static register(news: any) {
    this.news.push(news as News);
  }
}
