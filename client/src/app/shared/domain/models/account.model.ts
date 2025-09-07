export interface Account extends AccountBasic {
  description?: string;
}

export interface AccountBasic {
  id: string;
  name: string;
  balance: number;
}
