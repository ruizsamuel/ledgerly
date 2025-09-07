export interface TableConfig<T> {
  fields: (keyof T)[];
  avatars?: (keyof T)[];
  colorFns?: Partial<Record<keyof T, ColorFn<T>>>;
  formatFns?: Partial<Record<keyof T, FormatFn<T>>>;
  labels?: Partial<Record<keyof T, string>>;
  onClick?: Partial<Record<keyof T, (row: T) => void>>;
}

type ColorFn<T> = (value: any, row: T) => 'success' | 'error';
type FormatFn<T> = (value: any, row: T) => string;
