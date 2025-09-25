import { Expense, Income, Transaction, Transfer } from "../models/transaction.model";

export class TransactionUtils {
  static transactionsFromTransfer(transfer: Transfer): Transaction[] {
    const transactionFrom: Transaction = {
      amount: -Math.abs(transfer.amount),
      description: $localize`:{@@transferPrefix}:Transfer: ` + transfer.description,
      date: transfer.date,
      account: transfer.fromAccount,
    } as Transaction;

    const transactionTo: Transaction = {
      amount: Math.abs(transfer.amount),
      description: $localize`:{@@transferPrefix}:Transfer: ` + transfer.description,
      date: transfer.date,
      account: transfer.toAccount,
    } as Transaction;

    return [transactionFrom, transactionTo];
  }

  static transactionFromIncome(income: Income): Transaction {
    return income as Transaction;
  }

  static transactionFromExpense(expense: Expense): Transaction {
    return { ...expense, amount: -Math.abs(expense.amount) } as Transaction;
  }
}
