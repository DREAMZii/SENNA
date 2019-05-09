import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AppRouteModule} from './app.routing';

import {SennaFooterComponent, SennaHeaderComponent} from './core/components';
import {HomeComponent} from './views/home';
import {LoginComponent} from './views/login';

import {CustomAdalGuard} from '@app/core/guards/customAdal.guard';
import {ConfigService, CustomAdalService, AzureService, ReferenceService} from '@app/services';
import {CustomAdalInterceptor} from '@app/core/interceptors/customAdal.interceptor';

import {SennaAlertModule} from '@app/core/modules';

import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';
import {BubbleUtil} from "@app/core/util/bubble.util";

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
    AppRouteModule
  ],
  declarations: [
    AppComponent,
    SennaHeaderComponent,
    SennaFooterComponent,
    HomeComponent,
    LoginComponent
  ],
  providers: [
    CustomAdalService,
    CustomAdalGuard,
    ConfigService,
    AzureService,
    {provide: HTTP_INTERCEPTORS, useClass: CustomAdalInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(
    private referenceService: ReferenceService,
    private azureService: AzureService
  ) {
    BubbleUtil.referenceService = referenceService;
    BubbleUtil.azureService = azureService;
  }
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}
