import { computed, inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { User } from "../domain/models/user.model";
import { Response } from "../domain/models/response.model";
import { catchError, map, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LoginDTO } from "../domain/dto/login.dto";
import { NewUserDTO } from "../domain/dto/new-user.dto";

type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

const AUTH_URL = environment.apiBaseUrl + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }

    return 'unauthenticated';
  });

  user = computed(() => this._user());

  login(loginData: LoginDTO): Observable<Response<boolean>> {
    return this.http.post<Response<User>>(`${AUTH_URL}/login`, loginData)
      .pipe(
        map(res => {
          if (res.content) {
            this.handleAuthSuccess(res.content);
            return { content: true, status: res.status, message: res.message ?? $localize`:{@@authenticated}:Authenticated` };
          } else {
            return { content: false, status: res.status ?? 401, message: res.message ?? $localize`:{@@notAuthenticated}:Not authenticated` };
          }
        }),
        catchError(_err => {
          return this.handleAuthError();
        })
      );
  }

  register(newUser: NewUserDTO): Observable<Response<boolean>> {
    return this.http.post<Response<User>>(`${AUTH_URL}/register`, newUser)
      .pipe(
        map(res => {
          if (res.content) {
            this.handleAuthSuccess(res.content);
            return { content: true, status: res.status, message: res.message ?? $localize`:{@@registered}:Registered successfully` };
          } else {
            return { content: false, status: res.status ?? 400, message: res.message ?? $localize`:{@@registrationFailed}:Registration failed` };
          }
        }),
        catchError(_err => {
          return this.handleAuthError();
        })
      );
  }

  checkStatus(): Observable<Response<boolean>> {
    const user = localStorage.getItem('user');
    if (!user) {
      this.logout();
      return of({ content: false, status: 401, message: $localize`:{@@notAuthenticated}:Not authenticated` });
    }
    const parsedUser: User = JSON.parse(user);
    this._user.set(parsedUser);

    return this.http.get<Response<User>>(`${AUTH_URL}/me`)
      .pipe(
        map(res => {
          if (res.content) {
            res.content.token = parsedUser.token
            this.handleAuthSuccess(res.content);
            return { content: true, status: res.status, message: res.message ?? $localize`:{@@authenticated}:Authenticated` };
          } else {
            this.logout();
            return { content: false, status: res.status ?? 401, message: res.message ?? $localize`:{@@notAuthenticated}:Not authenticated` };
          }
        }),
        catchError(_err => {
          return this.handleAuthError()
        })
      );
  }

  private handleAuthSuccess(user: User) {
    this._user.set(user);
    this._authStatus.set('authenticated');

    localStorage.setItem('user', JSON.stringify(user));
  }

  private handleAuthError() {
    this.logout();
    return of({ content: false, status: 401, message: $localize`:{@@notAuthenticated}:Not authenticated` });
  }

  logout() {
    this._user.set(null);
    this._authStatus.set('unauthenticated');

    localStorage.removeItem('user');
  }
}
