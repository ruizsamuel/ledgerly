import { Component, computed, inject, input, output, signal } from "@angular/core";
import { SearchComponent } from "../search/search.component";
import { LoadingComponent } from "../loading/loading.component";
import { TableComponent } from "../table/table.component";
import { Transaction, TransactionBasic } from "../../../domain/models/transaction.model";
import { rxResource } from "@angular/core/rxjs-interop";
import { TransactionService } from "../../../service/transaction.service";
import { PaginationService } from "../../../service/pagination.service";
import { AccountService } from "../../../service/account.service";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { ModalService } from "../../../service/modal.service";
import { FormComponent } from "../form/form.component";
import { firstValueFrom } from "rxjs";
import { PaginationComponent } from "../pagination/pagination.component";
import { ConfirmationComponent } from "../confirmation/confirmation.component";
import { ToastService } from "../../../service/toast.service";
import { TransactionHelper } from "../../helpers/transaction.helper";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  imports: [SearchComponent, LoadingComponent, TableComponent, PaginationComponent, RouterLink],
  providers: [CurrencyPipe, DatePipe],
})
export class TransactionListComponent {

  service = inject(TransactionService);
  paginationService = inject(PaginationService);
  accountService = inject(AccountService);
  modalService = inject(ModalService);
  toastService = inject(ToastService);

  currencyPipe = inject(CurrencyPipe);
  datePipe = inject(DatePipe);

  transactionHelper = TransactionHelper;

  accountId = input<string | null>(null);

  change = output<void>();

  formTitle = $localize`:{@@editTransactionTitle}:Edit Transaction`;

  searchTerm = signal('');

  fromDate = signal<string | null>(null);
  toDate = signal<string | null>(new Date((new Date()).getFullYear(), 11, 31, 1, 1).toISOString().split('T')[0]);

  sortBy = signal<'date' | 'amount'>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  private from = computed(() => this.fromDate() ? new Date(this.fromDate()!) : null);
  private to = computed(() => this.toDate() ? new Date(this.toDate()!) : null);

  allResource = rxResource({
    params: () => ({
      page: this.paginationService.currentPage(),
      description: this.searchTerm(),
      fromDate: this.from(),
      toDate: this.to(),
      sortBy: this.sortBy(),
      sort: this.sortDirection(),
      account: this.accountId() ?? 'all',
    }),
    stream: ( request ) => {
      return this.service.getUserEntities(request.params);
    }
  });

  accountsResource = rxResource({
    params: () => ({}),
    stream: () => this.accountService.getUserEntities({ limit: 0 })
  });

  async showForm(entity: TransactionBasic) {
    const t: Transaction = (await firstValueFrom(this.service.getEntityById(entity.id))).content;
    this.modalService.open({
      component: FormComponent,
      inputs: {
        title: this.formTitle,
        fields: this.transactionHelper.createEditForm(t, this.accountsResource.value()?.content || []),
      },
      outputs: {
        formSubmit: (data: Transaction) => { data.id = t.id; this.handleSubmit(data) },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  };

  async handleDelete(entity: TransactionBasic) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteTransactionConfirmation}:Are you sure you want to delete the transaction?`,
      },
      outputs: {
        onResult: async (result: boolean) => {
          this.modalService.close();
          if (result) {
            await firstValueFrom(this.service.deleteEntity(entity.id!))
            .then(response => {
              this.toastService.show(response.message, 'success');
              this.change.emit();
              this.allResource.reload();
            })
            .catch(() => {})
          }
          this.modalService.close();
        }
      }
    });
  };

  async handleDeleteSelection(entities: TransactionBasic[]) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteSelectedTransactionsConfirmation}:Are you sure you want to delete the selected transactions?`,
      },
      outputs: {
        onResult: async (result: boolean) => {
          this.modalService.close();
          if (result) {
            Promise.all(entities.map(entity => firstValueFrom(this.service.deleteEntity(entity.id!))))
              .then(() => {
                this.toastService.show($localize`:{@@selectionDeleted}:Selected items have been deleted`, 'success');
                this.change.emit();
                this.allResource.reload();
              })
              .catch(() => {});
          }
          this.modalService.close();
        }
      }
    });
  }

  async handleSubmit(entity: Transaction) {
    await firstValueFrom(this.service.updateEntity(entity.id, entity))
    .then(response => {
      this.toastService.show(response.message, 'success');
      this.change.emit();
      this.allResource.reload();
    })
    .catch(() => {})
    this.modalService.close();
  }

  toggleSortDirection() {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }
}
