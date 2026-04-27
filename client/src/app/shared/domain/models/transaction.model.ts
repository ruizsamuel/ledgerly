export interface Transaction extends TransactionBasic {
  account: string;
}

export interface TransactionBasic {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface NewTransactionDTO {
  amount: number;
  description: string;
  date: string;
  account: string;
}

export interface UpdateTransactionDTO {
  amount?: number;
  description?: string;
  date?: string;
}

export interface ListTransactionDTO {
  limit?: number;
  page?: number;
  description?: string;
  fromDate?: string | null;
  toDate?: string | null;
  sortBy?: 'date' | 'amount';
  sort?: 'asc' | 'desc';
  account?: string;
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
