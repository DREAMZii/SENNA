import {Component} from '@angular/core';
import {SennaFormEntity} from "@app/core/components/senna-form/senna-form.entity";
import {Router} from "@angular/router";

@Component({
  selector: 'app-senna-form',
  templateUrl: 'senna-form.component.html',
  styleUrls: ['senna-form.component.css']
})
export class SennaFormComponent {

  constructor(
    private router: Router,
  ) {

  }

  searchTerm = '';

  onSubmit() {
    if (this.searchTerm === '') {
      return;
    }

    this.router.navigate(['/search', this.searchTerm]);
  }
}
