import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(
      Preferences.get({
        key: 'token',
      })
    ).pipe(
      switchMap((data: { value: string | null}) => { // null type may need to correct this later
        const token = data?.value;

        console.log('token:', token);
        if (token) {
          const cloneRequest = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token),
          })
          return next.handle(cloneRequest);
        }
        return next.handle(req);
      })
    )
  }

  constructor() { }
}
