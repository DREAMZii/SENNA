import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CustomAdalService} from '@app/services';
import { environment } from '@environments/environment';

@Injectable()
export class CustomAdalInterceptor implements HttpInterceptor {

  constructor(private adal: CustomAdalService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!this.avoidBearerToken(request) && this.adal.userInfo.authenticated) {

      const authorizedRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${this.adal.userInfo.token}`),
      });

      return next.handle(authorizedRequest);
    }

    return next.handle(request);
  }

  /** avoid adding a bearer token or the requests will be blocked */
  private avoidBearerToken(request: HttpRequest<any>): boolean {
    return request.url === environment.azure.cognitiveServices.newsSearchUrl
      ||
      request.url === environment.azure.cognitiveServices.searchUrl;
  }
}
