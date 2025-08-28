export interface NewAccountDTO {
  name: string;
  balance: number;
  description?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  balance?: number;
  description?: string;
}
