import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isUserLoggedIn.pipe(
      take(1),
      switchMap((isUserLoggedIn: boolean) => {
        if (isUserLoggedIn) {
          return of(isUserLoggedIn);
        }
        return this.authService.isTokenInStorage();
      }),
      tap((isUserLoggedIn: boolean) => {
        if (!isUserLoggedIn) {
          this.router.navigateByUrl('/auth');
        }
      }),
    );
  }
}
