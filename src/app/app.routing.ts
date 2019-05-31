import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './views/home';
import { LoginComponent } from './views/login';
import { CustomAdalGuard } from '@app/core/guards/customAdal.guard';
import {SearchComponent} from '@app/views/search';
import {SentimentComponent} from '@app/views/sentiment';
import {ScoreComponent} from '@app/views/score';

const appRoutes: Routes = [
  { path: '', component: SearchComponent, canActivate: [CustomAdalGuard] },
  { path: 'search/:q', component: HomeComponent, canActivate: [CustomAdalGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'sentiment', component: SentimentComponent },
  { path: 'score', component: ScoreComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const AppRouteModule = RouterModule.forRoot(appRoutes);
