import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { rxResource } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { PageTitleComponent } from "../../shared/common/ui/components/page-title/page-title.component";
import { TableComponent } from "../../shared/common/ui/components/table/table.component";
import { FormComponent } from "../../shared/common/ui/components/form/form.component";
import { Account, AccountBasic } from "../../shared/domain/models/account.model";
import { AccountService } from "../../shared/domain/services/account.service";
import { LoadingComponent } from "../../shared/common/ui/components/loading/loading.component";
import { ToastService } from "../../shared/common/services/toast.service";
import { PaginationService } from "../../shared/common/services/pagination.service";
import { PaginationComponent } from "../../shared/common/ui/components/pagination/pagination.component";
import { ModalService } from "../../shared/common/services/modal.service";
import { ConfirmationComponent } from "../../shared/common/ui/components/confirmation/confirmation.component";
import { AccountHelper } from "../../shared/domain/ui/helpers/account.helper";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  imports: [PageTitleComponent, TableComponent, LoadingComponent, PaginationComponent],
})
export class AccountsComponent {
  service = inject(AccountService);
  toastService = inject(ToastService);
  paginationService = inject(PaginationService);
  modalService = inject(ModalService);
  router = inject(Router);

  accountHelper = AccountHelper;

  formTitle = computed(() => this.selected() ? $localize`:{@@editAccountTitle}:Edit Account` : $localize`:{@@createAccountTitle}:Create Account`);

  selected = signal<Account | null>(null);

  pageTitle = $localize`:{@@accountsPageTitle}:Accounts`;
  pageDescription = $localize`:{@@accountsPageDescription}:Manage your accounts,
    view balances, and perform actions like edit or delete. Click on an account to see detailed transactions linked to it.`;

  allResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage() }),
    stream: ( request ) => {
      return this.service.getEntitiesByToken(request.params);
    }
  });

  async showForm(entity: AccountBasic | null) {
    if (entity) {
      entity = (await firstValueFrom(this.service.getEntityById(entity.id))).content;
    }
    this.selected.set(entity);
    this.modalService.open({
      component: FormComponent<Account>,
      inputs: {
        title: this.formTitle(),
        fields: this.accountHelper.createEditForm(this.selected()),
        submitButtonText: this.selected() ? $localize`:{@@updateButton}:Update` : $localize`:{@@createButton}:Create`
      },
      outputs: {
        formSubmit: (data: Account) => this.handleSubmit(data),
        formCancel: () => {
          this.selected.set(null);
          this.modalService.close();
        }
      }
    });
  };

  async handleDelete(entity: AccountBasic) {
    this.modalService.open({
      component: FormComponent<{ backupAccountId: string }>,
      inputs: {
        title: $localize`:{@@deleteAccountTitle}:Backup and Delete Account`,
        description: $localize`:{@@deleteAccountDescription}:Please select a backup account to transfer all transactions
          linked to this account before deletion. If no backup account is selected, ALL LINKED TRANSACTIONS WILL BE DELETED! This action cannot be undone.`,
        fields: this.accountHelper.deleteForm(entity.id, this.allResource.value()?.content || []),
        submitButtonText: $localize`:{@@deleteButton}:Delete`
      },
      outputs: {
        formSubmit: async (data: { backupAccountId: string }) => {
          await firstValueFrom(this.service.deleteEntity(entity.id!, data.backupAccountId))
            .then(response => {
              this.toastService.show(response.message, 'success');
              this.allResource.reload();
            })
            .catch(() => {});
          this.modalService.close();
        },
        formCancel: () => this.modalService.close()
      }
    });
  };

  async handleDeleteSelection(entities: AccountBasic[]) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteSelectedAccountsConfirmation}:Are you sure you want to delete the selected accounts?
          ALL TRANSACTIONS LINKED TO THESE ACCOUNTS WILL ALSO BE DELETED! This action cannot be undone.`,
        submitButtonText: $localize`:{@@deleteButton}:Delete`
      },
      outputs: {
        onResult: async (result: boolean) => {
          this.modalService.close();
          if (result) {
            Promise.all(entities.map(entity => firstValueFrom(this.service.deleteEntity(entity.id!))))
              .then(() => {
                this.toastService.show($localize`:{@@selectionDeleted}:Selected items have been deleted`, 'success');
                this.allResource.reload();
              })
              .catch(() => {});
          }
          this.modalService.close();
        }
      }
    });
  }

  async handleSubmit(entity: Account) {
    if (this.selected()?.id) {
      await firstValueFrom(this.service.updateEntity(this.selected()!.id, entity))
      .then(response => {
        this.toastService.show(response.message, 'success');
        this.allResource.reload();
      })
      .catch(() => {})
    } else {
      await firstValueFrom(this.service.createEntity(entity))
      .then(response => {
        this.toastService.show(response.message, 'success');
        this.allResource.reload();
      })
      .catch(() => {})
    }
    this.selected.set(null);
    this.modalService.close();
  }

  handleAccountClick(account: AccountBasic) {
    this.router.navigate(['/accounts', account.id]);
  }
}
