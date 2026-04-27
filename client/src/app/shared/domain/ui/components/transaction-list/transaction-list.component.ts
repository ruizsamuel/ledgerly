import { Component, computed, inject, input, output, signal } from "@angular/core";
import { SearchComponent } from "../../../../common/ui/components/search/search.component";
import { LoadingComponent } from "../../../../common/ui/components/loading/loading.component";
import { TableComponent } from "../../../../common/ui/components/table/table.component";
import { Transaction, TransactionBasic } from "../../../models/transaction.model";
import { rxResource } from "@angular/core/rxjs-interop";
import { TransactionService } from "../../../services/transaction.service";
import { PaginationService } from "../../../../common/services/pagination.service";
import { AccountService } from "../../../services/account.service";
import { ModalService } from "../../../../common/services/modal.service";
import { FormComponent } from "../../../../common/ui/components/form/form.component";
import { firstValueFrom } from "rxjs";
import { PaginationComponent } from "../../../../common/ui/components/pagination/pagination.component";
import { ConfirmationComponent } from "../../../../common/ui/components/confirmation/confirmation.component";
import { ToastService } from "../../../../common/services/toast.service";
import { TransactionHelper } from "../../helpers/transaction.helper";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  imports: [SearchComponent, LoadingComponent, TableComponent, PaginationComponent, RouterLink],
})
export class TransactionListComponent {

  service = inject(TransactionService);
  paginationService = inject(PaginationService);
  accountService = inject(AccountService);
  modalService = inject(ModalService);
  toastService = inject(ToastService);

  transactionHelper = TransactionHelper;

  accountId = input<string | null>(null);

  change = output<void>();

  formTitle = $localize`:{@@editTransactionTitle}:Edit Transaction`;

  searchTerm = signal('');

  fromDate = signal<string | null>(null);
  toDate = signal<string | null>(`${new Date().getFullYear()}-12-31`);

  sortBy = signal<'date' | 'amount'>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  private from = computed(() => this.fromDate() ? `${this.fromDate()}T00:00:00.000Z` : null);
  private to = computed(() => this.toDate() ? `${this.toDate()}T23:59:59.999Z` : null);

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
      return this.service.getEntitiesByToken(request.params);
    }
  });

  accountsResource = rxResource({
    params: () => ({}),
    stream: () => this.accountService.getEntitiesByToken({ limit: 0 })
  });

  async showForm(entity: TransactionBasic) {
    const t: Transaction = (await firstValueFrom(this.service.getEntityById(entity.id))).content;
    this.modalService.open({
      component: FormComponent,
      inputs: {
        title: this.formTitle,
        fields: this.transactionHelper.createEditForm(t, this.accountsResource.value()?.content || []),
        submitButtonText: $localize`:{@@updateButton}:Update`
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
        submitButtonText: $localize`:{@@deleteButton}:Delete`
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
        submitButtonText: $localize`:{@@deleteButton}:Delete`
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
