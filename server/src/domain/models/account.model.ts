export interface AccountBasic {
  id: string;
  name: string;
  balance: number;
}

export interface Account extends AccountBasic {
  description?: string;
}

export interface NewAccountDTO {
  name: string;
  balance: number;
  description?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  description?: string;
}
