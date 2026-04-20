import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { NewUserDTO, UpdateUserDTO, User } from '../models/user.model';
import { Response } from '../models/response.model';
import { environment } from '../../../../environments/environment';

const USERS_URL = environment.apiBaseUrl + '/users';

interface Options {
  limit?: number;
  page?: number;
  searchTerm?: string;
  sortBy?: 'date' | 'amount';
  sort?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  private _hasUsers = signal<boolean | null>(null);

  hasUsers = computed(() => this._hasUsers());

  getEntityByToken(): Observable<Response<User>> {
    return this.http.get<Response<User>>(`${USERS_URL}/me`);
  }

  updateEntityByToken(updateData: UpdateUserDTO): Observable<Response<User>> {
    return this.http.patch<Response<User>>(`${USERS_URL}/me`, updateData);
  }

  getAll(options: Options): Observable<Response<User[]>> {
    return this.http.get<Response<User[]>>(USERS_URL, { params: {
      limit: options.limit?.toString() ?? '8',
      page: options.page?.toString() ?? '1',
      searchTerm: options.searchTerm ?? '',
      sortBy: options.sortBy ?? 'date',
      sort: options.sort ?? 'desc',
    } });
  }

  createEntity(newUser: NewUserDTO): Observable<Response<User>> {
    return this.http.post<Response<User>>(USERS_URL, newUser);
  }

  updateEntity(id: string, updateData: UpdateUserDTO): Observable<Response<User>> {
    return this.http.patch<Response<User>>(`${USERS_URL}/${id}`, updateData);
  }

  deleteEntity(id: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${USERS_URL}/${id}`);
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
