import { Validators } from "@angular/forms";
import { Transaction, TransactionBasic } from "../../domain/models/transaction.model";
import { FormConfig } from "../types/form-config.model";
import { AccountBasic } from "../../domain/models/account.model";
import { FormUtils } from "../../../core/utils/form.utils";
import { TableConfig } from "../types/table-config.model";
import { LineChartSeries } from "../types/chart-config.model";

export class TransactionHelper {

  static MONTHS = [
    $localize`:{@@januaryShort}:Jan`,
    $localize`:{@@februaryShort}:Feb`,
    $localize`:{@@marchShort}:Mar`,
    $localize`:{@@aprilShort}:Apr`,
    $localize`:{@@mayShort}:May`,
    $localize`:{@@juneShort}:Jun`,
    $localize`:{@@julyShort}:Jul`,
    $localize`:{@@augustShort}:Aug`,
    $localize`:{@@septemberShort}:Sep`,
    $localize`:{@@octoberShort}:Oct`,
    $localize`:{@@novemberShort}:Nov`,
    $localize`:{@@decemberShort}:Dec`
  ];

  static table(): TableConfig<TransactionBasic> {
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
      formats: {
        amount: 'currency',
        date: 'date',
      }
    }
  }

  static tableBasic(): TableConfig<TransactionBasic> {
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
      formats: {
        amount: 'currency',
        date: 'date',
      },
      selectable: false,
      actions: false
    }
  }

  static previousYearComparativeChart(transactions: TransactionBasic[]): LineChartSeries {

    const thisYear = new Date().getFullYear();

    const currentYear: number[] = Array(12).fill(0);
    const previousYear: number[] = Array(12).fill(0);

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const amount = transaction.amount;

      if (year === thisYear) {
        currentYear[month] += amount;
      } else if (year === thisYear - 1) {
        previousYear[month] += amount;
      }
    });

    return [
      { name: $localize`:{@@currentYearBalanceLabel}:Balance - Current Year`, data: currentYear },
      { name: $localize`:{@@previousYearBalanceLabel}:Balance - Previous Year`, data: previousYear }
    ]
  }

  static createEditForm(transaction: Transaction | null, accounts: AccountBasic[]): FormConfig {
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
        value: transaction?.date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        validators: [Validators.required],
      },
    ];
  }

  static transferForm(accounts: AccountBasic[], defaultFromAccountId?: string) : FormConfig {
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

  static incomeExpenseForm(accounts: AccountBasic[]): FormConfig {
    return [
      {
        key: 'account',
        label: $localize`:{@@incomeExpenseAccountFieldLabel}:Account`,
        type: 'text',
        select: {
          options: (accounts.map(account => ({ viewValue: account.name, value: account.id }))),
          config: { avatars: true }
        },
        value: accounts[0]?.id ?? null,
        validators: [Validators.required],
      },
      {
        key: 'amount',
        label: $localize`:{@@incomeExpenseAmountFieldLabel}:Amount`,
        type: 'number',
        value: 0,
        validators: [Validators.required, Validators.min(0.01)],
      },
      {
        key: 'description',
        label: $localize`:{@@incomeExpenseDescriptionFieldLabel}:Description`,
        placeholder: $localize`:{@@incomeDescriptionFieldPlaceholder}:Description`,
        type: 'text',
        value: '',
        validators: [Validators.required, Validators.maxLength(64)],
      },
      {
        key: 'date',
        label: $localize`:{@@incomeExpenseDateFieldLabel}:Date`,
        type: 'date',
        value: new Date().toISOString().split('T')[0],
        validators: [Validators.required],
      },
    ];
  }
}
