import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Response } from '../../common/models/response.model';
import { Transaction, TransactionBasic, NewTransactionDTO, UpdateTransactionDTO } from '../models/transaction.model';
import { CacheService } from './cache.service';

const TRANSACTIONS_URL = environment.apiBaseUrl + '/transactions';

interface Options {
  limit?: number;
  page?: number;
  description?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  sortBy?: 'date' | 'amount';
  sort?: 'asc' | 'desc';
  account?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  getEntitiesByToken(options: Options): Observable<Response<TransactionBasic[]>> {
    const {
      limit = 8,
      page = 1,
      description = '',
      fromDate = null,
      toDate = null,
      sortBy = 'date',
      sort = 'desc',
      account = 'all'
    } = options;

    const key = `${limit}-${page}-${description?.toLowerCase()}-${fromDate}-${toDate}-${sortBy}-${sort}-${account}`;
    return this.cacheService.getTransactionsCache(key) ?? this.http.get<Response<Transaction[]>>(
      TRANSACTIONS_URL,
      { params: {
          limit: limit,
          page: page,
          description: description,
          toDate: toDate?.toISOString() ?? '',
          fromDate: fromDate?.toISOString() ?? '',
          sortBy: sortBy,
          sort: sort,
          account: account
        }
      }
    )
    .pipe(
      tap(response => this.cacheService.setTransactionsCache(key, response))
    );
  }

  getEntityById(id: string): Observable<Response<Transaction>> {
    return this.cacheService.getTransactionCache(id) ?? this.http.get<Response<Transaction>>(`${TRANSACTIONS_URL}/${id}`).pipe(
      tap(response => this.cacheService.setTransactionCache(id, response))
    );
  }

  createEntity(transaction: NewTransactionDTO): Observable<Response<Transaction>> {
    return this.http.post<Response<Transaction>>(TRANSACTIONS_URL, transaction)
    .pipe(
      tap(response => this.cacheService.setTransactionCache(response.content.id, response)),
      tap(() => this.cacheService.clearTransactionsCache())
    );
  }

  updateEntity(id: string, transaction: UpdateTransactionDTO): Observable<Response<Transaction>> {
    return this.http.patch<Response<Transaction>>(`${TRANSACTIONS_URL}/${id}`, transaction)
    .pipe(
      tap(response => this.cacheService.setTransactionCache(id, response)),
      tap(() => this.cacheService.clearTransactionsCache())
    );
  }

  deleteEntity(id: string): Observable<Response<null>> {
    return this.http.delete<Response<null>>(`${TRANSACTIONS_URL}/${id}`)
    .pipe(
      tap(() => this.cacheService.deleteTransactionCache(id)),
      tap(() => this.cacheService.clearTransactionsCache())
    );
  }
}
