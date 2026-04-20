import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Response } from '../../common/models/response.model';
import { Account, AccountBasic, NewAccountDTO, UpdateAccountDTO } from '../models/account.model';
import { CacheService } from './cache.service';

const ACCOUNTS_URL = environment.apiBaseUrl + '/accounts';

interface Options {
  limit?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  getEntitiesByToken(options: Options): Observable<Response<AccountBasic[]>> {
    const { limit = 8, page = 1 } = options;

    const key = `${limit}-${page}`;
    return this.cacheService.getAccountsCache(key) ?? this.http.get<Response<Account[]>>(
      ACCOUNTS_URL,
      { params: { limit: limit, page: page } }
    )
    .pipe(
      tap(response => this.cacheService.setAccountsCache(key, response))
    );
  }

  getEntityById(id: string): Observable<Response<Account>> {
    return this.cacheService.getAccountCache(id) ?? this.http.get<Response<Account>>(`${ACCOUNTS_URL}/${id}`).pipe(
      tap(response => this.cacheService.setAccountCache(id, response))
    );
  }

  createEntity(account: NewAccountDTO): Observable<Response<Account>> {
    return this.http.post<Response<Account>>(ACCOUNTS_URL, account)
    .pipe(
      tap(response => this.cacheService.setAccountCache(response.content.id, response)),
      tap(() => this.cacheService.clearAccountsCache())
    );
  }

  updateEntity(id: string, account: UpdateAccountDTO): Observable<Response<Account>> {
    return this.http.patch<Response<Account>>(`${ACCOUNTS_URL}/${id}`, account)
    .pipe(
      tap(response => this.cacheService.setAccountCache(id, response)),
      tap(() => this.cacheService.clearAccountsCache())
    );
  }

  deleteEntity(id: string, backupAccount?: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${ACCOUNTS_URL}/${id}`, { params: { backupAccount: backupAccount ?? '' } })
    .pipe(
      tap(() => this.cacheService.deleteAccountCache(id)),
      tap(() => this.cacheService.clearAccountsCache())
    );
  }
}
