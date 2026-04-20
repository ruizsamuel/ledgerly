export interface AccountBasic {
  id: string;
  name: string;
  balance: number;
}

export interface Account extends AccountBasic {
  description?: string;
}

export interface NewAccountInput {
  name: string;
  balance: number;
  description?: string;
}

export interface UpdateAccountInput {
  name?: string;
  description?: string;
}
