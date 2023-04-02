import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NewUser } from '../models/newUser.model';
import { Role, User } from '../models/user.model';
import { UserResponse } from '../models/userResponese.model';
import jwt_decode from 'jwt-decode';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$ = new BehaviorSubject<User>({});

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {

        const isUserAuthenticated = Object.keys(user).length !== 0;
        return of(isUserAuthenticated);
      }),
    );
  }

  // need to fix this any Role
  get userRole(): Observable<Role | any> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.role);
      }),
    );
  }

  get userId(): Observable<Role | any> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.id);
      }),
    );
  }

  constructor(private http: HttpClient, private router: Router) {}

  register(newUser: NewUser): Observable<User> {
    return this.http
      .post<User>(
        `${environment.baseApiUrl}/auth/register`,
        newUser,
        this.httpOptions,
      )
      .pipe(take(1));
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${environment.baseApiUrl}/auth/login`,
        { email, password },
        this.httpOptions,
      )
      .pipe(
        take(1),
        tap((response: { token: string }) => {
          Preferences.set({
            key: 'token',
            value: response.token,
          });
          const decodedToken: UserResponse = jwt_decode(response.token);

          this.user$.next(decodedToken.user);
        }),
      );
  }

  // May cuse issuies but had to and null to type
  isTokenInStorage(): Observable<boolean> {
    return from(
      Preferences.get({
        key: 'token',
      }),
    ).pipe(
      map((data: { value: string | null }) => {
        if (!data || !data.value) return false;
        const decodedToken: UserResponse = jwt_decode(data.value);
        const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
        const isExpired = new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);
  
        if (isExpired) return false;
        if (decodedToken.user) {
          this.user$.next(decodedToken.user);
          return true;
        }
        return false;
      }),
    );
  }
  

  logout(): void {
    this.user$.next({});
    Preferences.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
