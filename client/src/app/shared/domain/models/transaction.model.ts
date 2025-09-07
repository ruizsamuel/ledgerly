export interface Transaction extends TransactionBasic {
  account: string;
}

export interface TransactionBasic {
  id: string;
  amount: number;
  description: string;
  date: string;
}
