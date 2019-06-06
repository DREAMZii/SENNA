import {NewsManager} from '@app/core/entities/news/news.manager';
import {Bubble} from '@app/core/entities/bubble/bubble.entity';

export abstract class NewsAbstract {
  // Core
  protected readonly id: number;
  protected readonly name: string;
  protected readonly description: string;
  protected readonly category: any;
  protected readonly url: string;
  protected readonly datePublished: string;
  protected readonly source: string;

  protected constructor(name, description, category, url, datePublished, source) {
    this.id = NewsManager.news.length;
    this.name = name;
    this.description = description;
    this.category = category;
    this.url = url;
    this.datePublished = datePublished;
    this.source = source;

    NewsManager.register(this);
  }

  /**
   * Draws the given news
   *
   * @param bubble  - that news gets attached to
   */
  public abstract draw(bubble: Bubble);

  /** GETTER **/

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }

  public getDescription() {
    return this.description;
  }

  public getUrl() {
    return this.url;
  }

  public getDatePublished() {
    return this.datePublished;
  }

  public getSource() {
    return this.source;
  }
}
