import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AppRouteModule} from './app.routing';

import {SennaFooterComponent, SennaHeaderComponent} from './core/components';
import {HomeComponent} from './views/home';
import {LoginComponent} from './views/login';

import {CustomAdalGuard} from '@app/core/guards/customAdal.guard';
import {ConfigService, CustomAdalService, AzureService, ReferenceService, NewsService} from '@app/services';
import {CustomAdalInterceptor} from '@app/core/interceptors/customAdal.interceptor';

import {SennaAlertModule} from '@app/core/modules';

import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';
import {StaticService} from '@app/services/static.service';
import {SearchComponent} from '@app/views/search';
import {SennaFormComponent} from '@app/core/components/senna-form/senna-form.component';
import {SennaNewsComponent} from '@app/core/components/senna-news/senna-news.component';
import {SennaAlertService} from '@app/core/modules/senna-alert/senna-alert.service';
import {SentimentComponent} from '@app/views/sentiment';
import {ScoreComponent} from '@app/views/score';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    SennaAlertModule,
    TranslateModule.forRoot({
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      },
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRouteModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    SennaHeaderComponent,
    SennaFooterComponent,
    HomeComponent,
    LoginComponent,
    SearchComponent,
    SennaFormComponent,
    SennaNewsComponent,
    SentimentComponent,
    ScoreComponent
  ],
  providers: [
    CustomAdalService,
    CustomAdalGuard,
    ConfigService,
    AzureService,
    NewsService,
    {provide: HTTP_INTERCEPTORS, useClass: CustomAdalInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(
    private referenceService: ReferenceService,
    private azureService: AzureService,
    private newsService: NewsService,
    private alertService: SennaAlertService
  ) {
    StaticService.referenceService = referenceService;
    StaticService.azureService = azureService;
    StaticService.newsService = newsService;
    StaticService.alertService = alertService;
  }
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}
