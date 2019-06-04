import {Injectable} from '@angular/core';
import {Bubble} from "@app/core/entities/bubble/bubble.entity";

@Injectable({ providedIn: 'root' })
export class BubbleManager {
  private static bubbles = new Map<String, Bubble>();

  public static register(searchTerm: string, bubble: any) {
    this.bubbles.set(searchTerm, bubble as Bubble);
  }

  public static getBubbleMap(): Map<String, Bubble> {
    return this.bubbles;
  }

  public static getBubbles() : Bubble[] {
    return Array.from(this.bubbles.values());
  }
}
