export interface TableConfig<T> {
  fields: (keyof T)[];
  avatars?: (keyof T)[];
  formats?: Partial<Record<keyof T, Format>>;
  colorFns?: Partial<Record<keyof T, ColorFn<T>>>;
  labels?: Partial<Record<keyof T, string>>;
  selectable?: boolean;
  actions?: boolean;
}

type ColorFn<T> = (value: any, row: T) => 'success' | 'error' | 'primary' | 'accent' | 'secondary';
type Format = 'text' | 'currency' | 'date' | 'percent' | 'boolean';
