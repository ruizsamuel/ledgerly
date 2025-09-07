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
