import {Injectable} from '@angular/core';
import {Bubble} from '@app/core/entities/bubble/bubble.entity';

@Injectable({ providedIn: 'root' })
export class BubbleManager {
  private static bubbles = new Map<String, Bubble>();

  private static initialBubble: Bubble;
  private static activeBubble: Bubble;

  public static register(searchTerm: string, bubble: any) {
    // First bubble is active
    if (!this.initialBubble) {
      this.initialBubble = bubble;
      this.activeBubble = bubble;
    }

    this.bubbles.set(searchTerm, bubble as Bubble);
  }

  public static getInitialBubble() {
    return this.initialBubble;
  }

  public static setActiveBubble(bubble: Bubble) {
    this.activeBubble = bubble;
  }

  public static getActiveBubble() {
    return this.activeBubble;
  }

  public static getBubbleMap(): Map<String, Bubble> {
    return this.bubbles;
  }

  public static getBubbles(): Bubble[] {
    return Array.from(this.bubbles.values());
  }
}
