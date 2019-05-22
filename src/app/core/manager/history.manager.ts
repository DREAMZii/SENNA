import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class HistoryManager {
  private history = [];

  public addHistoryElement(searchTerm: string) {
    if (this.history.length >= 10) {
      delete this.history[0];
    }

    this.history.push(searchTerm);
  }

  public back() {
    delete this.history[this.history.length - 1];
  }
}
