import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  submitted = false;
}
