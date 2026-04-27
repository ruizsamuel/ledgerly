export interface TransactionBasic {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Transaction extends TransactionBasic {
  account: string;
}

export interface NewTransactionDTO {
  amount: number;
  description: string;
  date?: string;
  account: string;
}

export interface UpdateTransactionDTO {
  amount?: number;
  description?: string;
  date?: string;
  account?: string;
}

export interface ListTransactionDTO {
  page: number;
  limit: number;
  sortBy: "date" | "amount";
  sort: "asc" | "desc";
  description?: string;
  fromDate?: string;
  toDate?: string;
  account?: string;
}
