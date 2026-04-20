import { Component, computed, inject } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AccountService } from "../../../shared/domain/services/account.service";
import { TransactionListComponent } from "../../../shared/domain/ui/components/transaction-list/transaction-list.component";
import { LoadingComponent } from "../../../shared/common/ui/components/loading/loading.component";
import { CurrencyPipe, PercentPipe } from "@angular/common";
import { TransactionService } from "../../../shared/domain/services/transaction.service";
import { ModalService } from "../../../shared/common/services/modal.service";
import { FormComponent } from "../../../shared/common/ui/components/form/form.component";
import { TransactionHelper } from "../../../shared/domain/ui/helpers/transaction.helper";
import { firstValueFrom } from "rxjs";
import { Transaction, Transfer } from "../../../shared/domain/models/transaction.model";
import { ToastService } from "../../../shared/common/services/toast.service";
import { TransactionUtils } from "../../../shared/domain/utils/transaction.utils";

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  imports: [TransactionListComponent, LoadingComponent, RouterLink, CurrencyPipe, PercentPipe ],
})
export class AccountDetailComponent {
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);

  private transactionHelper = TransactionHelper;
  private transactionUtils = TransactionUtils;

  private accountId = this.activatedRoute.snapshot.params['id'];

  thisMonth = computed(() => {
    if (this.thisMontResource.value()) {
      return this.thisMontResource.value()!.content.reduce((sum, transaction) => sum + transaction.amount, 0);
    }
    return 0;
  });

  overLastMonthTotal = computed(() => {
    if (this.thisMontResource.value() && this.lastMontResource.value()) {
      const thisMonthTotal = this.thisMontResource.value()!.content.reduce((sum, transaction) => sum + transaction.amount, 0);
      const lastMonthTotal = this.lastMontResource.value()!.content.reduce((sum, transaction) => sum + transaction.amount, 0);
      return thisMonthTotal - lastMonthTotal;
    }
    return 0;
  });

  overLastMonthRelative = computed(() => {
    if (this.thisMontResource.value() && this.lastMontResource.value()) {
      const thisMonthTotal = this.thisMontResource.value()!.content.reduce((sum, transaction) => sum + transaction.amount, 0);
      const lastMonthTotal = this.lastMontResource.value()!.content.reduce((sum, transaction) => sum + transaction.amount, 0);
      if (lastMonthTotal === 0) {
        return thisMonthTotal === 0 ? 0 : 1;
      }
      return ((thisMonthTotal - lastMonthTotal) / Math.abs(lastMonthTotal));
    }
    return 0;
  });

  accountResource = rxResource({
    params: () => ({ id: this.accountId }),
    stream: ( request ) => this.accountService.getEntityById(request.params.id)
  });

  thisMontResource = rxResource({
    params: () => ({ accountId: this.accountId }),
    stream: ( request ) => this.transactionService.getEntitiesByToken({
      account: request.params.accountId,
      fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 2, 1),
      toDate: new Date(),
      limit: 0,
    })
  });

  lastMontResource = rxResource({
    params: () => ({ accountId: this.accountId }),
    stream: ( request ) => this.transactionService.getEntitiesByToken({
      account: request.params.accountId,
      fromDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 2, 1),
      toDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      limit: 0,
    })
  });

  handleListChange() {
    this.accountResource.reload();
    this.thisMontResource.reload();
    this.lastMontResource.reload();
  }

  async handleAddTransaction() {
    const accounts = (await (firstValueFrom(this.accountService.getEntitiesByToken({ limit: 0 })))).content;
    this.modalService.open({
      component: FormComponent<Transaction>,
      inputs: {
        title: $localize`:{@@createTransactionTitle}:Create Transaction`,
        fields: this.transactionHelper.createEditForm({account: this.accountId} as Transaction, accounts),
        submitButtonText: $localize`:{@@createButton}:Create`
      },
      outputs: {
        formSubmit: (data: Transaction) => {
          firstValueFrom(this.transactionService.createEntity(data))
            .then((res) => {
              this.toastService.show(res.message, 'success');
              this.modalService.close();
              this.handleListChange();
            });
        },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  }

  async handleTransfer() {
    const accounts = (await (firstValueFrom(this.accountService.getEntitiesByToken({ limit: 0 })))).content;
    this.modalService.open({
      component: FormComponent<Transfer>,
      inputs: {
        title: $localize`:{@@createTransactionTitle}:Create Transaction`,
        fields:this.transactionHelper.transferForm(accounts, this.accountId),
        submitButtonText: $localize`:{@@createButton}:Create`
      },
      outputs: {
        formSubmit: (data: Transfer) => {
          const transactions = this.transactionUtils.transactionsFromTransfer(data);
          Promise.all(transactions.map(transaction => firstValueFrom(this.transactionService.createEntity(transaction))))
            .then(() => {
              this.toastService.show($localize`:{@@transferCreatedToast}:Transfer created`, 'success');
              this.modalService.close();
              this.handleListChange();
            });
        },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  }
}
