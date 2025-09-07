import { Component, computed, inject } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AccountService } from "../../../shared/service/account.service";
import { TransactionListComponent } from "../../../shared/ui/components/transaction-list/transaction-list.component";
import { LoadingComponent } from "../../../shared/ui/components/loading/loading.component";
import { CurrencyPipe, PercentPipe } from "@angular/common";
import { TransactionService } from "../../../shared/service/transaction.service";

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  imports: [TransactionListComponent, LoadingComponent, RouterLink, CurrencyPipe, PercentPipe],
})
export class AccountDetailComponent {
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

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
    stream: ( request ) => this.transactionService.getUserEntities({
      account: request.params.accountId,
      fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 2, 1),
      toDate: new Date(),
      limit: -1,
    })
  });

  lastMontResource = rxResource({
    params: () => ({ accountId: this.accountId }),
    stream: ( request ) => this.transactionService.getUserEntities({
      account: request.params.accountId,
      fromDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 2, 1),
      toDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      limit: -1,
    })
  });

  handleListChange() {
    this.accountResource.reload();
    this.thisMontResource.reload();
    this.lastMontResource.reload();
  }
}
