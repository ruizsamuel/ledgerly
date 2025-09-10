import { Validators } from "@angular/forms";
import { Transaction, TransactionBasic } from "../../domain/models/transaction.model";
import { FormConfig } from "../types/form-config.model";
import { Account } from "../../domain/models/account.model";
import { FormUtils } from "../../../core/utils/form.utils";
import { TableConfig } from "../types/table-config.model";
import { CurrencyPipe, DatePipe } from "@angular/common";

export class TransactionHelper {

  static table(currencyPipe: CurrencyPipe, datePipe: DatePipe): TableConfig<TransactionBasic> {
    return {
      fields: ['description', 'amount', 'date'],
      labels: {
        description: $localize`:{@@descriptionTableHeader}:Description`,
        amount: $localize`:{@@amountTableHeader}:Amount`,
        date: $localize`:{@@dateTableHeader}:Date`,
      },
      colorFns: {
        amount: (value) => (value >= 0 ? 'success' : 'error'),
      },
      formatFns: {
        amount: (value) => currencyPipe.transform(value) ?? '',
        date: (value) => datePipe.transform(value, 'shortDate') ?? '',
      }
    }
  }

  static createEditForm(transaction: Transaction | null, accounts: Account[]): FormConfig {
    return [
      {
        key: 'description',
        label: $localize`:{@@transactionDescriptionFieldLabel}:Transaction Description`,
        placeholder: $localize`:{@@transactionDescriptionFieldPlaceholder}:Description`,
        type: 'text',
        value: transaction?.description ?? '',
        validators: [Validators.required, Validators.maxLength(64)],
      },
      {
        key: 'amount',
        label: $localize`:{@@transactionAmountFieldLabel}:Transaction Amount`,
        type: 'number',
        value: transaction?.amount ?? 0,
        validators: [Validators.required],
      },
      {
        key: 'account',
        label: $localize`:{@@transactionAccountFieldLabel}:Account`,
        type: 'text',
        select: {
          options: (accounts.map(account => ({ viewValue: account.name, value: account.id }))),
          config: { avatars: true }
        },
        value: transaction?.account ?? accounts[0]?.id ?? null,
        validators: [Validators.required],
      },
      {
        key: 'date',
        label: $localize`:{@@transactionDateFieldLabel}:Transaction Date`,
        type: 'date',
        value: transaction?.date ?? new Date().toISOString().split('T')[0],
        validators: [Validators.required],
      },
    ];
  }

  static transferForm(accounts: Account[], defaultFromAccountId?: string) : FormConfig {
    return [
      {
        key: 'fromAccount',
        label: $localize`:{@@transferFromAccountFieldLabel}:From Account`,
        type: 'text',
        select: {
          options: (accounts.map(account => ({ viewValue: account.name, value: account.id }))),
          config: { avatars: true }
        },
        value: defaultFromAccountId,
        validators: [Validators.required],
      },
      {
        key: 'toAccount',
        label: $localize`:{@@transferToAccountFieldLabel}:To Account`,
        type: 'text',
        select: {
          options: (accounts.map(account => ({ viewValue: account.name, value: account.id }))),
          config: { avatars: true }
        },
        value: null,
        validators: [Validators.required, FormUtils.fieldNotEqualValidator('fromAccount')],
      },
      {
        key: 'amount',
        label: $localize`:{@@transferAmountFieldLabel}:Transfer Amount`,
        type: 'number',
        value: 0,
        validators: [Validators.required, Validators.min(0.01)],
      },
      {
        key: 'description',
        label: $localize`:{@@transferDescriptionFieldLabel}:Transfer Description`,
        placeholder: $localize`:{@@transferDescriptionFieldPlaceholder}:Description`,
        type: 'text',
        value: '',
        validators: [Validators.required, Validators.maxLength(64)],
      },
      {
        key: 'date',
        label: $localize`:{@@transferDateFieldLabel}:Transfer Date`,
        type: 'date',
        value: new Date().toISOString().split('T')[0],
        validators: [Validators.required],
      },
    ];
  }
}
