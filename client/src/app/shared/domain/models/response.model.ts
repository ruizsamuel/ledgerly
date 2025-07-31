export interface Response<T> {
  status: number;
  message?: string;
  content?: T;
}
