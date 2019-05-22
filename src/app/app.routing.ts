import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './views/home';
import { LoginComponent } from './views/login';
import { CustomAdalGuard } from '@app/core/guards/customAdal.guard';
import {SearchComponent} from '@app/views/search';

const appRoutes: Routes = [
  { path: '', component: SearchComponent, canActivate: [CustomAdalGuard] },
  { path: 'search/:q', component: HomeComponent, canActivate: [CustomAdalGuard] },
  { path: 'login', component: LoginComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const AppRouteModule = RouterModule.forRoot(appRoutes);
