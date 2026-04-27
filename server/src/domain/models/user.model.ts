export interface UserBasic {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface User extends UserBasic {}

export interface UserWithPassword extends User {
  password: string
}

export interface NewUserInput {
  email: string;
  name: string;
  password: string;
  isAdmin?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  isAdmin?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
