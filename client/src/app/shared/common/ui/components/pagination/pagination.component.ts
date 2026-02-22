import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { PaginationService } from '../../../services/pagination.service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {

  private paginationService = inject(PaginationService);

  pages = input(0);
  currentPage = input<number>(1);

  activePage = linkedSignal(this.currentPage);

  getPagesList = computed(() => {
    const total = this.pages();
    const current = this.activePage();

    if (total <= 10) {
      return total > 1 ? Array.from({ length: total }, (_, i) => i + 1) : [];
    }
    const pages: (number)[] = [];
    if (current <= 3) {
      pages.push(1, 2, 3, 4, -1, total);
    } else if (current >= total - 2) {
      pages.push(1, -1, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, -1, current - 1, current, current + 1, -1, total);
    }
    return pages;
  });

  constructor() {
    effect(() => {
      this.paginationService.setCurrentPage(this.activePage());
    });
    effect(() => {
      const total = this.pages();
      if (total && this.activePage() > total) this.activePage.set(total);
    });
  }
}
