import {BubbleManager} from '@app/core/entities/bubble/bubble.manager';
import * as d3 from 'd3';
import {BubbleSegment} from '@app/core/entities/bubble/components/bubble.segment';
import {News, NewsSentiment} from '@app/core/entities/news/news.entity';
import {ZoomConfig} from '@app/core/config/zoom.config';
import {BubbleNametag} from '@app/core/entities/bubble/components/bubble.nametag';
import {BubbleStatistic} from '@app/core/entities/bubble/components/bubble.statistic';
import {BubbleImage} from '@app/core/entities/bubble/components/bubble.image';

export abstract class BubbleAbstract {
  // Core values
  protected readonly id: number;
  protected readonly searchTerm: any;
  protected readonly searchImage: any;
  protected readonly container: any;
  protected readonly radius: number;
  protected readonly strokeWidth: number;
  protected readonly news: News[];
  protected group: any;

  // Zoom
  protected zoom;

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
    this.id = BubbleManager.getNextId();
    this.searchTerm = searchTerm;
    this.searchImage = searchImage;
    this.container = d3.select('#graphContainer').select('#canvas');
    this.radius = radius;
    this.strokeWidth = radius / 5;
    this.news = news as News[];

    // Config
    this.setMiddlePoint();
    this.initSegments();
    this.handleZoom();
  }

  private handleZoom() {
    const container = this.container;
    const graphContainer = d3.select((container.node() as HTMLElement).parentElement);

    this.zoom = d3.zoom()
      .touchable(true)
      .scaleExtent([-Infinity, Infinity])
      .on('start', () => {
        d3.select('#canvas')
          .style('cursor', 'move');
      })
      .on('zoom', zoomed)
      .on('end', () => {
        d3.select('#canvas')
          .style('cursor', 'default');
      });

    function zoomed() {
      // Loading
      if (ZoomConfig.zoomDisabled) {
        return;
      }

      container.selectAll('g')
        .filter(function() {
          return d3.select(this).classed('bubble') || d3.select(this).classed('line');
        })
        .attr('transform', d3.event.transform);
    }

    graphContainer.call(this.zoom);
    graphContainer.on('dblclick.zoom', null);
  }

  private initSegments() {
    for (const single of this.news) {
      const previousSegments = this.segments.has(single.getSentiment())
        ? this.segments.get(single.getSentiment()) : [];

      const segment = new BubbleSegment(this, single);
      previousSegments.push(segment);

      this.segments.set(single.getSentiment(), previousSegments);
    }
  }

  /**
   * Sets the Middle-Point for the circle
   *
   * @param cx  - center x
   * @param cy  - center y
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
   * Get segments for types or an empty array
   *
   * @param type  - type to get segments for
   */
  public getSegments(type: NewsSentiment): BubbleSegment[] {
    return this.segments.has(type) ? this.segments.get(type) : [];
  }

  /**
   * Draws the image in the center of the circle
   */
  public drawImage() {
    const image = new BubbleImage(this);
    image.draw();
  }

  /**
   * Draws the name tag and statistic
   */
  public drawNameTagAndStatistic() {
    const nameTag = new BubbleNametag(this);
    nameTag.draw();

    const statistic = new BubbleStatistic(this, nameTag);
    statistic.draw();
  }

  /**
   * Get the amount of segments in a bubble based on the sentiment
   *
   * @param type  - sentiment of the news
   */
  public getSegmentCount(type: NewsSentiment): number {
    const segments = this.segments.get(type);
    if (segments === undefined) {
      return 0;
    }

    return segments.length;
  }

  /** GETTER **/
  public getId() {
    return this.id;
  }

  public getSearchTerm() {
    return this.searchTerm;
  }

  public getSearchImage() {
    return this.searchImage;
  }

  public getContainer() {
    return this.container;
  }

  public getGroup() {
    return this.group;
  }

  public getZoom() {
    return this.zoom;
  }

  public getNews() {
    return this.news;
  }

  public getAngleDistance() {
    const count = this.getSegmentCount(NewsSentiment.POSITIVE)
      + this.getSegmentCount(NewsSentiment.NEUTRAL)
      + this.getSegmentCount(NewsSentiment.NEGATIVE);

    return 360 / count;
  }

  public getStrokeWidth() {
    return this.strokeWidth;
  }

  public getRadius() {
    return this.radius;
  }

  public getCenterX() {
    return this.x;
  }

  public getCenterY() {
    return this.y;
  }
}
