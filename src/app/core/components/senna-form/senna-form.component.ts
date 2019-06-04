import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-senna-form',
  templateUrl: 'senna-form.component.html',
  styleUrls: ['senna-form.component.css']
})
export class SennaFormComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }

  searchTerm = '';

  onSubmit() {
    if (this.searchTerm === '') {
      return;
    }

    const url = this.route.snapshot.url;
    if (url.length > 0 && url[0].path === 'score') {
      this.router.navigate(['/score'], {queryParams: {q: this.searchTerm}});
    } else {
      this.router.navigate(['/search', this.searchTerm]);
    }
  }
}
