export interface NewUserDTO {
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  isAdmin?: boolean;
}
