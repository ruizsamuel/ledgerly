import { Validators } from "@angular/forms";
import { Account, AccountBasic } from "../../domain/models/account.model";
import { FormConfig } from "../types/form-config.model";
import { TableConfig } from "../types/table-config.model";
import { CurrencyPipe } from "@angular/common";

export class AccountHelper {

  static table(currencyPipe: CurrencyPipe): TableConfig<AccountBasic> {
    return {
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
        balance: (value) => currencyPipe.transform(value) ?? '',
      },
    };
  }

  static createEditForm(account: Account | null): FormConfig {
    return [
      {
        key: 'name',
        label: $localize`:@@accountNameFieldLabel:Account Name`,
        type: 'text',
        value: account?.name ?? '',
        validators: [Validators.required, Validators.maxLength(64)],
      },
      {
        key: 'balance',
        label: $localize`:@@initialBalance:Initial Balance`,
        type: 'number',
        value: account?.balance ?? 0,
        validators: [Validators.required],
        disabled: account !== null
      },
      {
        key: 'description',
        label: $localize`:@@accountDescriptionFieldLabel:Description`,
        type: 'text',
        optional: true,
        value: account?.description ?? '',
        validators: [Validators.maxLength(128)],
      }
    ];
  }

  static deleteForm(accountId: string, accounts: Account[]): FormConfig {
    return [
      {
        key: 'backupAccountId',
        label: $localize`:{@@backupAccountFieldLabel}:Backup Account`,
        type: 'text',
        select: {
          options: [{ viewValue: $localize`:{@@noBackupAccountOption}:No Backup Account`, value: '' }].concat
          (accounts
            .filter(acc => acc.id !== accountId)
            .map(account => ({ viewValue: account.name, value: account.id })) || []),
          config: { avatars: true }
        },
        value: '',
      }
    ];
  }
}
