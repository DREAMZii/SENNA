export class News {
  private readonly name: string;
  private readonly description: string;
  private category: any;
  private readonly url: string;
  private datePublished: string;

  public sentiment = 0.5;

  constructor(name, description, category, url, datePublished) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.url = url;
    this.datePublished = datePublished;
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
}
