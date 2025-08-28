import { computed, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  private _currentPage = signal(1);
  currentPage = computed(() => this._currentPage());

  setCurrentPage(page: number) {
    this._currentPage.set(page);
  }
}
