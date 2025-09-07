import { Injectable } from "@angular/core";
import { Response } from "../../core/types/response.model";
import { Account, AccountBasic } from "../domain/models/account.model";
import { Observable, of } from "rxjs";
import { Transaction, TransactionBasic } from "../domain/models/transaction.model";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private accountsCache = new Map<string, Response<AccountBasic[]>>();
  private accountCache = new Map<string, Response<Account>>();

  private transactionsCache = new Map<string, Response<TransactionBasic[]>>();
  private transactionCache = new Map<string, Response<Transaction>>();

  /* Account Cache */

  getAccountsCache(key: string): Observable<Response<AccountBasic[]>> | null {
    return this.accountsCache.has(key) ? of(this.accountsCache.get(key)!) : null;
  }

  getAccountCache(key: string): Observable<Response<Account>> | null {
    return this.accountCache.has(key) ? of(this.accountCache.get(key)!) : null;
  }

  setAccountsCache(key: string, response: Response<AccountBasic[]>): void {
    this.accountsCache.set(key, response);
  }

  setAccountCache(id: string, response: Response<Account>): void {
    this.accountCache.set(id, response);
  }

  deleteAccountCache(id: string): void {
    this.accountCache.delete(id);
    this.transactionsCache.clear();
    this.transactionCache.clear();
  }

  clearAccountsCache(): void {
    this.accountsCache.clear();
  }

  /* Transaction Cache */

  getTransactionsCache(key: string): Observable<Response<TransactionBasic[]>> | null {
    return this.transactionsCache.has(key) ? of(this.transactionsCache.get(key)!) : null;
  }

  getTransactionCache(key: string): Observable<Response<Transaction>> | null {
    return this.transactionCache.has(key) ? of(this.transactionCache.get(key)!) : null;
  }

  setTransactionsCache(key: string, response: Response<TransactionBasic[]>): void {
    this.transactionsCache.set(key, response);
  }

  setTransactionCache(id: string, response: Response<Transaction>): void {
    this.deleteTransactionCache(id);
    this.accountCache.forEach(accRes => {
      if (accRes.content.id === response.content.account) {
        const acc = accRes.content;
        const existingTransaction = this.transactionCache.get(id);
        if (existingTransaction) {
          acc.balance -= existingTransaction.content.amount;
        }
        acc.balance += response.content.amount;
      }
    });
    this.accountsCache.forEach(accRes => {
      const acc = accRes.content.find(a => a.id === response.content.account);
      if (acc) {
        const existingTransaction = this.transactionCache.get(id);
        if (existingTransaction) {
          acc.balance -= existingTransaction.content.amount;
        }
        acc.balance += response.content.amount;
      }
    });
    this.transactionCache.set(id, response);
  }

  deleteTransactionCache(id: string): void {
    if (!this.transactionCache.has(id)) {
      this.accountsCache.clear();
      this.accountCache.clear();
    } else {
      this.accountCache.forEach(accRes => {
        const acc = accRes.content;
        const existingTransaction = this.transactionCache.get(id);
        if (acc.id === existingTransaction!.content.account) {
          acc.balance -= existingTransaction!.content.amount;
        }
      });
      this.accountsCache.forEach(accRes => {
        const acc = accRes.content.find(a => a.id === this.transactionCache.get(id)?.content.account);
        const existingTransaction = this.transactionCache.get(id);
        if (acc) {
          acc.balance -= existingTransaction!.content.amount;
        }
      });
    }
    this.transactionCache.delete(id);
  }

  clearTransactionsCache(): void {
    this.transactionsCache.clear();
  }
}
