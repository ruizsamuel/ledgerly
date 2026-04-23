import { ClientSession } from "mongodb";

export interface Response<T> {
  message: string;
  content: T;
  page?: number;
  totalPages?: number;
}

export type DbSession = ClientSession
