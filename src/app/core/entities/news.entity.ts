export class News {
  private readonly name: string;
  private description: string;
  private category: any;
  private url: string;
  private datePublished: string;

  public sentiment: number;

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
}
