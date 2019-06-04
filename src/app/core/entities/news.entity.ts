import {NewsUtil} from '@app/core/util/news.util';
import {BubbleSegmentColor} from "@app/core/entities/bubble/bubble.segment";

export enum NewsSentiment {
  POSITIVE, NEUTRAL, NEGATIVE
}

export class News {
  public static readonly positiveThreshhold = 0.55;
  public static readonly negativeThreshhold = 0.45;

  private readonly id: number;

  private readonly name: string;
  private readonly description: string;
  private readonly category: any;
  private readonly url: string;
  private readonly datePublished: string;
  private readonly source: string;

  private sentiment: NewsSentiment;

  public contentAvailable = false;
  public score = 0.5;

  constructor(name, description, category, url, datePublished, source) {
    this.id = NewsUtil.news.length;
    this.name = name;
    this.description = description;
    this.category = category;
    this.url = url;
    this.datePublished = datePublished;
    this.source = source;
    this.initSentiment();

    NewsUtil.news.push(this);
  }

  private initSentiment() {
    if (this.score >= News.positiveThreshhold) {
      this.sentiment = NewsSentiment.POSITIVE;
    } else if (this.score > News.negativeThreshhold && this.score < News.positiveThreshhold) {
      this.sentiment = NewsSentiment.NEUTRAL;
    } else {
      this.sentiment = NewsSentiment.NEGATIVE;
    }
  }

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

  public getScore() {
    return this.score;
  }

  public getSentiment() {
    return this.sentiment;
  }

  public getScoreColor() {
    switch (this.sentiment) {
      case NewsSentiment.POSITIVE:
        return BubbleSegmentColor.GREEN;
      case NewsSentiment.NEGATIVE:
        return BubbleSegmentColor.RED;
      default:
        return BubbleSegmentColor.GRAY;
    }
  }
}
