import {ExpirationStrategy} from 'node-ts-cache/src/strategies/ExpirationStrategy';
import {MemoryStorage} from 'node-ts-cache/src/storages/MemoryStorage';
import {ServiceUtil} from '@app/core/util/service.util';

export class CacheUtil {
  private static cache = new ExpirationStrategy(new MemoryStorage());

  public static async getNews(term: string) {
    const key = 'news-' + term.split(' ').join('-').toLowerCase();
    const cachedNews = await this.cache.getItem(key);
    if (cachedNews) {
      return cachedNews;
    }

    let news = await ServiceUtil.azureService.searchNews(term);
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

    let news = await ServiceUtil.azureService.searchOldNews(term);
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

    const references = await ServiceUtil.referenceService.getReferences(term, amount);
    await this.cache.setItem(key, references, {isCachedForever: true});

    console.log('Cached references for ' + term);

    return references;
  }
}
