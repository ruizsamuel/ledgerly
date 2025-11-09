import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { NewUserDTO, UpdateUserDTO } from '../domain/dto/user.dto';
import { User } from '../domain/models/user.model';
import { Response } from '../../core/types/response.model';
import { environment } from '../../../environments/environment';

const USERS_URL = environment.apiBaseUrl + '/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private _hasUsers = signal<boolean | null>(null);

  hasUsers = computed(() => this._hasUsers());

  getUserByToken(): Observable<Response<User>> {
    return this.http.get<Response<User>>(`${USERS_URL}/me`);
  }

  updateUserByToken(updateData: UpdateUserDTO): Observable<Response<User>> {
    return this.http.patch<Response<User>>(`${USERS_URL}/me`, updateData);
  }

  newUser(newUser: NewUserDTO): Observable<Response<User>> {
    return this.http.post<Response<User>>(USERS_URL, newUser);
  }

  async checkHasUsers() {
    try {
      const res = await firstValueFrom(this.http.get<Response<{ content: boolean }>>(`${USERS_URL}/has-users`));
      this._hasUsers.set(!!res.content);
    } catch (err: any) {
      throw new Error($localize`:{@@hasUsersError}:Error checking for users: ${err.message}`);
    }
  }
}
