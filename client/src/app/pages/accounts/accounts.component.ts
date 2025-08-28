import { Component, computed, inject, signal } from "@angular/core";
import { PageTitleComponent } from "../../shared/ui/components/page-title/page-title.component";
import { TableComponent } from "../../shared/ui/components/table/table.component";
import { TableConfig } from "../../shared/ui/types/table-config.model";
import { CurrencyPipe } from "@angular/common";
import { GenericFormComponent } from "../../shared/ui/components/generic-form/generic-form.component";
import { FormField } from "../../shared/ui/types/form-field.model";
import { FormBuilder, Validators } from "@angular/forms";
import { Account, AccountBasic } from "../../shared/domain/models/accounts.model";
import { firstValueFrom } from "rxjs";
import { AccountService } from "../../shared/service/account.service";
import { rxResource } from "@angular/core/rxjs-interop";
import { LoadingComponent } from "../../shared/ui/components/loading/loading.component";
import { ToastService } from "../../shared/service/toast.service";
import { PaginationService } from "../../shared/service/pagination.service";
import { PaginationComponent } from "../../shared/ui/components/pagination/pagination.component";
import { ModalService } from "../../shared/service/modal.service";
import { ConfirmationComponent } from "../../shared/ui/components/confirmation/confirmation.component";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  imports: [PageTitleComponent, TableComponent, GenericFormComponent, LoadingComponent, PaginationComponent],
  providers: [CurrencyPipe],
})
export class AccountsComponent {
  service = inject(AccountService);
  toastService = inject(ToastService);
  paginationService = inject(PaginationService);
  modalService = inject(ModalService);

  currencyPipe = inject(CurrencyPipe);
  fb = inject(FormBuilder);

  formTitle = computed(() => this.selected() ? $localize`:{@@editAccountTitle}:Edit Account` : $localize`:{@@createAccountTitle}:Create Account`);

  selected = signal<Account | null>(null);

  pageTitle = $localize`:{@@accountsPageTitle}:Accounts`;
  pageDescription = $localize`:{@@accountsPageDescription}:Manage your accounts, view balances, and perform actions like edit or delete.`;

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
    }
  };

  formFields: FormField[] = [
    {
      key: 'name',
      label: $localize`:{@@accountNameFieldLabel}:Account Name`,
      type: 'text',
    },
    {
      key: 'balance',
      label: $localize`:{@@initialBalance}:Initial Balance`,
      type: 'number',
    },
    {
      key: 'description',
      label: $localize`:{@@accountDescriptionFieldLabel}:Description`,
      type: 'text',
    }
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    balance: [0, [Validators.required]],
    description: ['', Validators.maxLength(128)],
  })

  async showForm(entity: AccountBasic | null) {
    if (entity) {
      entity = (await firstValueFrom(this.service.getEntityById(entity.id))).content!;
    }
    this.selected.set(entity);
    this.modalService.open({
      component: GenericFormComponent,
      inputs: {
        title: this.formTitle(),
        fields: this.formFields,
        formGroup: this.form,
        initialData: this.selected()
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

  async handleDelete(entity: Account) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteAccountConfirmation}:Are you sure you want to delete the account?`,
      },
      outputs: {
        onResult: async (result: boolean) => {
          this.modalService.close();
          if (result) {
            await firstValueFrom(this.service.deleteEntity(entity.id!))
            .then(response => {
              this.toastService.show(response.message!, 'success');
              this.allResource.reload();
            })
            .catch(() => {})
          }
          this.modalService.close();
        }
      }
    });
  };

  async handleDeleteSelection(entities: AccountBasic[]) {
    this.modalService.open({
      component: ConfirmationComponent,
      inputs: {
        message: $localize`:{@@deleteSelectedAccountsConfirmation}:Are you sure you want to delete the selected accounts?`,
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
    if (this.selected()) {
      entity.id = this.selected()!.id;
      await firstValueFrom(this.service.updateEntity(entity))
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
