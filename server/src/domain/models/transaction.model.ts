export interface TransactionBasic {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Transaction extends TransactionBasic {
  account: string;
}

export interface NewTransactionInput {
  amount: number;
  description: string;
  date?: string;
  account: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  description?: string;
  date?: string;
  account?: string;
}
