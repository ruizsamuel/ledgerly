import { Component, inject, signal } from "@angular/core";
import { PageTitleComponent } from "../../shared/ui/components/page-title/page-title.component";
import { FormComponent } from "../../shared/ui/components/form/form.component";
import { FormField } from "../../shared/ui/types/form-field.model";
import { Validators } from "@angular/forms";
import { Transaction } from "../../shared/domain/models/transaction.model";
import { firstValueFrom } from "rxjs";
import { TransactionService } from "../../shared/service/transaction.service";
import { rxResource } from "@angular/core/rxjs-interop";
import { ToastService } from "../../shared/service/toast.service";
import { ModalService } from "../../shared/service/modal.service";
import { AccountService } from "../../shared/service/account.service";
import { TransactionListComponent } from "../../shared/ui/components/transaction-list/transaction-list.component";

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

  isLoading = signal(false);

  pageTitle = $localize`:{@@transactionsPageTitle}:Transactions`;
  pageDescription = $localize`:{@@transactionsPageDescription}:Manage your financial transactions here. You can create, edit, and delete transactions as needed.`;

  formTitle = $localize`:{@@createTransactionTitle}:Create Transaction`

  accountsResource = rxResource({
    params: () => ({}),
    stream: () => this.accountService.getUserEntities({ limit: 0 })
  });

  formFields(): FormField[] {
    return [
      {
        key: 'description',
        label: $localize`:{@@transactionDescriptionFieldLabel}:Transaction Description`,
        placeholder: $localize`:{@@transactionDescriptionFieldPlaceholder}:Description`,
        type: 'text',
        value: '',
        validators: [Validators.required, Validators.maxLength(64)],
      },
      {
        key: 'amount',
        label: $localize`:{@@transactionAmountFieldLabel}:Transaction Amount`,
        type: 'number',
        value: 0,
        validators: [Validators.required],
      },
      {
        key: 'account',
        label: $localize`:{@@transactionAccountFieldLabel}:Account`,
        type: 'text',
        select: {
          options: (this.accountsResource.value()?.content.map(account => ({ viewValue: account.name, value: account.id })) || []),
          config: { avatars: true }
        },
        value: this.accountsResource.value()?.content[0] ?? null,
        validators: [Validators.required],
      },
      {
        key: 'date',
        label: $localize`:{@@transactionDateFieldLabel}:Transaction Date`,
        type: 'date',
        value: new Date().toISOString().split('T')[0],
        validators: [Validators.required],
      },
    ];
  }

  async showForm() {
    this.modalService.open({
      component: FormComponent,
      inputs: {
        title: this.formTitle,
        fields: this.formFields(),
      },
      outputs: {
        formSubmit: (data: Transaction) => this.handleSubmit(data),
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  };

  async handleSubmit(entity: Transaction) {
    this.isLoading.set(true);
    await firstValueFrom(this.service.createEntity(entity))
    .then(response => {
      this.toastService.show(response.message!, 'success');
    })
    .catch(() => {})

    this.isLoading.set(false);
    this.modalService.close();
  }
}
