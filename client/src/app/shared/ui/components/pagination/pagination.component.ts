import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { PaginationService } from '../../../service/pagination.service';

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
    return this.pages() > 1 ? Array.from({ length: this.pages() }, (_, i) => i + 1) : [];
  });

  constructor() {
    effect(() => {
      this.paginationService.setCurrentPage(this.activePage());
    });
  }
}
