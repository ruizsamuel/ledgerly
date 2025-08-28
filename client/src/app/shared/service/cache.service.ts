import { Injectable } from "@angular/core";
import { Response } from "../../core/types/response.model";
import { Account, AccountBasic } from "../domain/models/accounts.model";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private accountsCache = new Map<string, Response<AccountBasic[]>>();
  private accountCache = new Map<string, Response<Account>>();

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
    // TODO: Remove transaction cache if implemented
  }

  clearAccountsCache(): void {
    this.accountsCache.clear();
  }
}
