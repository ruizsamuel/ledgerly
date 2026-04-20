export interface Response<T> {
  message: string;
  content: T;
  page?: number;
  totalPages?: number;
}