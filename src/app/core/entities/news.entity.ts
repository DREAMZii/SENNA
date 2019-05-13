export class News {
  private readonly name: string;
  private readonly description: string;
  private readonly category: any;
  private readonly url: string;
  private readonly datePublished: string;
  private readonly source: string;

  public sentiment = 0.5;

  constructor(name, description, category, url, datePublished, source) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.url = url;
    this.datePublished = datePublished;
    this.source = source;
  }

  public getName() {
    return this.name;
  }

  public getDatePublished() {
    return this.datePublished;
  }

  public getSource() {
    return this.source;
  }

  public getScore() {
    return this.sentiment;
  }
}
