import {ExpirationStrategy} from 'node-ts-cache/src/strategies/ExpirationStrategy';
import {MemoryStorage} from 'node-ts-cache/src/storages/MemoryStorage';
import {StaticService} from '@app/services/static.service';

export class Cache {
  private static cache = new ExpirationStrategy(new MemoryStorage());

  public static async getNews(term: string) {
    const key = 'news-' + term.split(' ').join('-').toLowerCase();
    const cachedNews = await this.cache.getItem(key);
    if (cachedNews) {
      return cachedNews;
    }

    let news = await StaticService.azureService.searchNews(term);
    if (!news) {
      news = [];
    }
    await this.cache.setItem(key, news, {isCachedForever: true});

    console.log('Cached news for ' + key);

    return news;
  }

  public static async getOldNews(term: string) {
    const key = 'news-old-' + term.split(' ').join('-').toLowerCase();
    const cachedNews = await this.cache.getItem(key);
    if (cachedNews) {
      return cachedNews;
    }

    let news = await StaticService.azureService.searchOldNews(term);
    if (!news) {
      news = [];
    }
    await this.cache.setItem(key, news, {isCachedForever: true});

    console.log('Cached old news (' + news.length + ') for ' + key);

    return news;
  }

  public static async getReferences(term: string, amount = 4, searchUrl = null) {
    const key = 'references-' + term.split(' ').join('-').toLowerCase();
    const cachedReferences = await this.cache.getItem(key);
    if (cachedReferences) {
      return cachedReferences;
    }

    const references = await StaticService.referenceService.getReferences(term, amount, searchUrl);
    await this.cache.setItem(key, references, {isCachedForever: true});

    console.log('Cached references for ' + term);

    return references;
  }
}
