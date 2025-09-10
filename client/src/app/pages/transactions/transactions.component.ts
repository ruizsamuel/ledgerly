import { Component, inject, signal } from "@angular/core";
import { PageTitleComponent } from "../../shared/ui/components/page-title/page-title.component";
import { FormComponent } from "../../shared/ui/components/form/form.component";
import { Transaction } from "../../shared/domain/models/transaction.model";
import { firstValueFrom } from "rxjs";
import { TransactionService } from "../../shared/service/transaction.service";
import { ToastService } from "../../shared/service/toast.service";
import { ModalService } from "../../shared/service/modal.service";
import { AccountService } from "../../shared/service/account.service";
import { TransactionListComponent } from "../../shared/ui/components/transaction-list/transaction-list.component";
import { TransactionHelper } from "../../shared/ui/helpers/transaction.helper";
import { rxResource } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  imports: [PageTitleComponent, TransactionListComponent],
})
export class TransactionsComponent {

  service = inject(TransactionService);
  accountService = inject(AccountService);
  toastService = inject(ToastService);
  modalService = inject(ModalService);

  transactionHelper = TransactionHelper;

  isLoading = signal(false);
  formLoading = signal(false);

  pageTitle = $localize`:{@@transactionsPageTitle}:Transactions`;
  pageDescription = $localize`:{@@transactionsPageDescription}:Manage your financial transactions here. You can create, edit, and delete transactions as needed.`;

  formTitle = $localize`:{@@createTransactionTitle}:Create Transaction`

  accountsResource = rxResource({
    params: () => ({}),
    stream: () => this.accountService.getUserEntities({ limit: 0 })
  });

  async showForm() {
    this.formLoading.set(true);
    this.modalService.open({
      component: FormComponent,
      inputs: {
        title: this.formTitle,
        fields: this.transactionHelper.createEditForm(null, this.accountsResource.value()?.content || []),
      },
      outputs: {
        formSubmit: (data: Transaction) => this.handleSubmit(data),
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
    this.formLoading.set(false);
  };

  async handleSubmit(entity: Transaction) {
    this.isLoading.set(true);
    await firstValueFrom(this.service.createEntity(entity))
    .then(response => {
      this.toastService.show(response.message, 'success');
    })
    .catch(() => {})

    this.isLoading.set(false);
    this.modalService.close();
  }
}
