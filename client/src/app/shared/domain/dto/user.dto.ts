export interface NewUserDTO {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
}
