import { Component, computed, inject, signal } from "@angular/core";
import { PageTitleComponent } from "../../shared/ui/components/page-title/page-title.component";
import { TableComponent } from "../../shared/ui/components/table/table.component";
import { TableConfig } from "../../shared/ui/types/table-config.model";
import { CurrencyPipe } from "@angular/common";
import { FormComponent } from "../../shared/ui/components/form/form.component";
import { FormField } from "../../shared/ui/types/form-field.model";
import { Account, AccountBasic } from "../../shared/domain/models/account.model";
import { firstValueFrom } from "rxjs";
import { AccountService } from "../../shared/service/account.service";
import { rxResource } from "@angular/core/rxjs-interop";
import { LoadingComponent } from "../../shared/ui/components/loading/loading.component";
import { ToastService } from "../../shared/service/toast.service";
import { PaginationService } from "../../shared/service/pagination.service";
import { PaginationComponent } from "../../shared/ui/components/pagination/pagination.component";
import { ModalService } from "../../shared/service/modal.service";
import { ConfirmationComponent } from "../../shared/ui/components/confirmation/confirmation.component";
import { Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  imports: [PageTitleComponent, TableComponent, LoadingComponent, PaginationComponent],
  providers: [CurrencyPipe],
})
export class AccountsComponent {
  service = inject(AccountService);
  toastService = inject(ToastService);
  paginationService = inject(PaginationService);
  modalService = inject(ModalService);
  router = inject(Router);

  currencyPipe = inject(CurrencyPipe);

  formTitle = computed(() => this.selected() ? $localize`:{@@editAccountTitle}:Edit Account` : $localize`:{@@createAccountTitle}:Create Account`);

  selected = signal<Account | null>(null);

  pageTitle = $localize`:{@@accountsPageTitle}:Accounts`;
  pageDescription = $localize`:{@@accountsPageDescription}:Manage your accounts, view balances, and perform actions like edit or delete. Click on an account to see detailed transactions linked to it.`;

  allResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage() }),
    stream: ( request ) => {
      return this.service.getUserEntities(request.params);
    }
  });

  tableConfig: TableConfig<AccountBasic> = {
    fields: ['name', 'balance'],
    labels: {
      name: $localize`:{@@accountNameLabel}:Account Name`,
      balance: $localize`:{@@accountBalanceLabel}:Balance`,
    },
    avatars: ['name'],
    colorFns: {
      balance: (value) => (value >= 0 ? 'success' : 'error'),
    },
    formatFns: {
      balance: (value) => this.currencyPipe.transform(value) ?? '',
    },
    onClick: {
      name: (row) => this.router.navigate(['/accounts', row.id]),
    }
  };

  formFields(): FormField[] {
    return [
      {
        key: 'name',
        label: $localize`:{@@accountNameFieldLabel}:Account Name`,
        type: 'text',
        value: this.selected()?.name ?? '',
        validators: [Validators.required, Validators.maxLength(64)],
      },
      {
        key: 'balance',
        label: $localize`:{@@initialBalance}:Initial Balance`,
        type: 'number',
        value: this.selected()?.balance ?? 0,
        validators: [Validators.required],
        disabled: this.selected() !== null
      },
      {
        key: 'description',
        label: $localize`:{@@accountDescriptionFieldLabel}:Description`,
        type: 'text',
        optional: true,
        value: this.selected()?.description ?? '',
        validators: [Validators.maxLength(128)],
      }
    ];
  }

  async showForm(entity: AccountBasic | null) {
    if (entity) {
      entity = (await firstValueFrom(this.service.getEntityById(entity.id))).content;
    }
    this.selected.set(entity);
    this.modalService.open({
      component: FormComponent<Account>,
      inputs: {
        title: this.formTitle(),
        fields: this.formFields(),
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
      component: FormComponent<Account>,
      inputs: {
        title: $localize`:{@@deleteAccountTitle}:Backup and Delete Account`,
        description: $localize`:{@@deleteAccountDescription}:Please select a backup account to transfer all transactions linked to this account before deletion. If no backup account is selected, all linked transactions will be deleted along with the account.`,
        fields: [
          {
            key: 'backupAccount',
            label: $localize`:{@@backupAccountFieldLabel}:Backup Account`,
            type: 'text',
            select: {
              options: [{ viewValue: $localize`:{@@noBackupAccountOption}:No Backup Account`, value: '' }].concat
              (this.allResource.value()?.content
                .filter(acc => acc.id !== entity.id)
                .map(account => ({ viewValue: account.name, value: account.id })) || []),
              config: { avatars: true }
            },
            value: '',
          }
        ],
      },
      outputs: {
        formSubmit: async (data: { backupAccount: string }) => {
          await firstValueFrom(this.service.deleteEntity(entity.id!, data.backupAccount))
            .then(response => {
              this.toastService.show(response.message!, 'success');
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
        message: $localize`:{@@deleteSelectedAccountsConfirmation}:Are you sure you want to delete the selected accounts? All transactions linked to these accounts will also be deleted.`,
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
        this.toastService.show(response.message!, 'success');
        this.allResource.reload();
      })
      .catch(() => {})
    } else {
      await firstValueFrom(this.service.createEntity(entity))
      .then(response => {
        this.toastService.show(response.message!, 'success');
        this.allResource.reload();
      })
      .catch(() => {})
    }
    this.selected.set(null);
    this.modalService.close();
  }
}
