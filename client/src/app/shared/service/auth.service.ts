import { computed, inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { User } from "../domain/models/user.model";
import { Response } from "../../core/types/response.model";
import { catchError, map, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LoginDTO, RegisterDTO } from "../domain/dto/auth.dto";
import { ToastService } from "./toast.service";

type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

const AUTH_URL = environment.apiBaseUrl + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

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

  login(loginData: LoginDTO): Observable<boolean> {
    return this.http.post<Response<User>>(`${AUTH_URL}/login`, loginData)
      .pipe(
        map(res => {
          if (res.content) {
            this.handleAuthSuccess(res.content);
          }
          return !!res.content;
        }),
        catchError(_err => {
          return this.handleAuthError();
        })
      );
  }

  register(newUser: RegisterDTO): Observable<boolean> {
    return this.http.post<Response<User>>(`${AUTH_URL}/register`, newUser)
      .pipe(
        map(res => {
          if (res.content) {
            this.handleAuthSuccess(res.content);
          }
          return !!res.content;
        }),
        catchError(_err => {
          return this.handleAuthError();
        })
      );
  }

  checkStatus(): Observable<boolean> {
    const user = localStorage.getItem('user');
    if (!user) {
      this.logout();
      return of(false);
    }
    const parsedUser: User = JSON.parse(user);
    this._user.set(parsedUser);

    return this.http.get<Response<User>>(`${AUTH_URL}/me`)
      .pipe(
        map(res => {
          if (res.content) {
            res.content.token = parsedUser.token
            this.handleAuthSuccess(res.content);
            return true;
          } else {
            this.toastService.show($localize`:{@@sessionExpired}:Session expired, please log in again.`, 'error');
            this.logout();
            return false;
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
    return of(false);
  }

  logout() {
    this._user.set(null);
    this._authStatus.set('unauthenticated');

    localStorage.removeItem('user');
  }
}
