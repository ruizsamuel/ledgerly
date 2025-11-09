import { computed, inject, Injectable, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { Response } from "../../core/types/response.model";
import { ChangePasswordDTO, LoginDTO, RegisterDTO } from "../domain/dto/auth.dto";
import { UserService } from "./user.service";

type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

const AUTH_URL = environment.apiBaseUrl + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private _token = signal<string | null>(null);
  private _user = rxResource({
    params: () => ({ token: this._token() }),
    stream: ( request ) => {
      this.userService.checkHasUsers();
      if (request.params.token) return this.userService.getUserByToken();
      else return of(null);
    }
  })

  token = computed(() => this._token());
  authStatus = computed<AuthStatus>(() => {
    if (this._user.isLoading()) return 'checking';
    else if (this._user.value()?.content?.id) return 'authenticated';
    else return 'unauthenticated';
  });
  user = computed(() => this._user.value()?.content || null);

  login(loginData: LoginDTO) {
    firstValueFrom(this.http.post<Response<{ token: string }>>(`${AUTH_URL}/login`, loginData, { withCredentials: true }))
      .then(res => {
        if (res.content) {
          this._token.set(res.content.token);
        }
      })
  }

  refresh() {
    firstValueFrom(this.http.post<Response<{ token: string }>>(`${AUTH_URL}/refresh`, {}, { withCredentials: true }))
      .then(res => {
        this._token.set(res.content?.token ?? null);
      })
      .catch(() => this._token.set(null));
  }

  async logout() {
    await firstValueFrom(this.http.delete(`${AUTH_URL}/logout`, { withCredentials: true }));
    this._token.set(null);
  }

  register(newUser: RegisterDTO) {
    firstValueFrom(this.http.post<Response<{ token: string }>>(`${AUTH_URL}/register`, newUser , { withCredentials: true }))
      .then(res => {
        if (res.content) {
          this._token.set(res.content.token);
        }
      })
  }

  changePassword(data: ChangePasswordDTO): Observable<Response<null>> {
    return this.http.patch<Response<null>>(`${AUTH_URL}/change-password`, data);
  }
}
