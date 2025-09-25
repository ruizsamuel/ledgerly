export interface Transaction extends TransactionBasic {
  account: string;
}

export interface TransactionBasic {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Transfer {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  date: string;
}

export type Income = Transaction;
export type Expense = Transaction;
