import { Component, computed, inject, effect } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { LineChartComponent } from "../../shared/ui/components/line-chart/line-chart.component";
import { TableComponent } from "../../shared/ui/components/table/table.component";
import { TransactionService } from "../../shared/service/transaction.service";
import { TransactionHelper } from "../../shared/ui/helpers/transaction.helper";
import { LoadingComponent } from "../../shared/ui/components/loading/loading.component";
import { AccountService } from "../../shared/service/account.service";
import { ModalService } from "../../shared/service/modal.service";
import { FormComponent } from "../../shared/ui/components/form/form.component";
import { Income, Transfer } from "../../shared/domain/models/transaction.model";
import { TransactionUtils } from "../../shared/domain/utils/transaction.utils";
import { ToastService } from "../../shared/service/toast.service";
import { CurrencyPipe } from "@angular/common";
import { NoAccountsComponent } from "../../shared/ui/components/no-accounts/no-accounts.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [LineChartComponent, TableComponent, LoadingComponent, CurrencyPipe],
})
export class DashboardComponent {

  transactionService = inject(TransactionService);
  accountService = inject(AccountService);
  modalService = inject(ModalService);
  toastService = inject(ToastService);

  transactionHelper = TransactionHelper;
  transactionUtils = TransactionUtils;

  totalBalance = computed(() => {
    let total = 0;
    const accounts = this.accountsResource.value();
    accounts?.content.forEach(account => {
      if (account.balance) total += account.balance;
    });
    return total;
  });

  thisMonthBalance = computed(() => {
    let total = 0;
    const transactions = this.transactionResource.value();
    transactions?.content.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      if (transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()) {
        total += transaction.amount;
      }
    });
    return total;
  });

  transactionResource = rxResource({
    params: () => ({ limit: 0, fromDate: new Date(new Date().getFullYear() - 1, 0, 1, 1, 1) }),
    stream: ( request ) => {
      return this.transactionService.getUserEntities(request.params);
    }
  });

  accountsResource = rxResource({
    params: () => ({ limit: 0 }),
    stream: ( request ) => {
      return this.accountService.getUserEntities(request.params)
    }
  });

  constructor() {
    effect(() => {
      const accounts = this.accountsResource.value();
      if (accounts?.content && accounts.content.length === 0) {
        this.modalService.open({
          component: NoAccountsComponent
        });
      }
    });
  }

  handleAddIncome() {
    const accounts = this.accountsResource.value()?.content || [];
    this.modalService.open({
      component: FormComponent<Income>,
      inputs: {
        title: $localize`:{@@newIncomeTitle}:New Income`,
        fields:this.transactionHelper.incomeExpenseForm(accounts)
      },
      outputs: {
        formSubmit: (data: Income) => {
          const transaction = this.transactionUtils.transactionFromIncome(data);
          firstValueFrom(this.transactionService.createEntity(transaction))
            .then(() => {
              this.toastService.show($localize`:{@@incomeCreatedToast}:Income created`, 'success');
              this.modalService.close();
              this.reloadResources();
            });
        },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  }

  handleAddExpense() {
    const accounts = this.accountsResource.value()?.content || [];
    this.modalService.open({
      component: FormComponent<Income>,
      inputs: {
        title: $localize`:{@@newExpenseTitle}:New Expense`,
        fields:this.transactionHelper.incomeExpenseForm(accounts)
      },
      outputs: {
        formSubmit: (data: Income) => {
          const transaction = this.transactionUtils.transactionFromExpense(data);
          firstValueFrom(this.transactionService.createEntity(transaction))
            .then(() => {
              this.toastService.show($localize`:{@@expenseCreatedToast}:Expense created`, 'success');
              this.modalService.close();
              this.reloadResources();
            });
        },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  }

  handleTransfer() {
    const accounts = this.accountsResource.value()?.content || [];
    this.modalService.open({
      component: FormComponent<Transfer>,
      inputs: {
        title: $localize`:{@@createTransactionTitle}:Create Transaction`,
        fields:this.transactionHelper.transferForm(accounts)
      },
      outputs: {
        formSubmit: (data: Transfer) => {
          const transactions = this.transactionUtils.transactionsFromTransfer(data);
          Promise.all(transactions.map(transaction => firstValueFrom(this.transactionService.createEntity(transaction))))
            .then(() => {
              this.toastService.show($localize`:{@@transferCreatedToast}:Transfer created`, 'success');
              this.modalService.close();
              this.reloadResources();
            });
        },
        formCancel: () => {
          this.modalService.close();
        }
      }
    });
  }

  reloadResources() {
    this.transactionResource.reload();
    this.accountsResource.reload();
  }
}
