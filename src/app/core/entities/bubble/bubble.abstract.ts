import {BubbleManager} from "@app/core/entities/bubble/bubble.manager";
import * as d3 from "d3";
import {BubbleSegment} from "@app/core/entities/bubble/bubble.segment";
import {News, NewsSentiment} from "@app/core/entities/news.entity";

export abstract class BubbleAbstract {
  // Core values
  protected readonly searchTerm: any;
  protected readonly searchImage: any;
  protected readonly container: any;
  protected readonly radius: number;
  protected readonly strokeWidth: number;
  protected readonly news: News[];

  // Middle-point
  protected x: number;
  protected y: number;

  // Segment counter
  protected segments = new Map<NewsSentiment, BubbleSegment[]>();

  protected constructor(
    searchTerm: string,
    searchImage: string,
    news: any,
    radius: number
  ) {
    this.searchTerm = searchTerm;
    this.searchImage = searchImage;
    this.container = d3.select('#graphContainer').select('#canvas');
    this.radius = radius;
    this.strokeWidth = radius / 5;
    this.news = news as News[];

    // Config
    this.setMiddlePoint();
    this.initSegments();

    // Register
    BubbleManager.register(this.searchTerm, this);
  }

  private initSegments() {
    this.news.forEach((single) => {
      const segment = new BubbleSegment(single.getSentiment(), single.getScoreColor());

      let previousSegments = this.segments.get(single.getSentiment());
      if (previousSegments === undefined) {
        previousSegments = [];
      }
      previousSegments.push(segment);

      this.segments.set(single.getSentiment(), previousSegments);
    });
  }

  /**
   * Sets the middle-point of the bubble
   *
   * @param cx  - center x or middle of screen if not set
   * @param cy  - center y or middle of screen if not set
   */
  protected setMiddlePoint(cx?: number, cy?: number) {
    const rect = this.container.node().getBoundingClientRect();
    this.x = cx ? cx : rect.width / 2;
    this.y = cy ? cy : rect.height / 2;
  }

  /**
   * Spawns circle
   *
   * @param positionX - possible starting X coordinate (uses centered x of svg when not given)
   * @param positionY - possible starting Y coordinate (uses centered y of svg when not given)
   */
  public abstract spawn(positionX?, positionY?);

  /**
   * Get the amount of segments in a bubble based on the sentiment
   *
   * @param type  - sentiment of the news
   */
  public getSegmentCount(type: NewsSentiment): number {
    return this.segments.get(type).length;
  }
}
