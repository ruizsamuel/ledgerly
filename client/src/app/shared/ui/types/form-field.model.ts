export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local';
  placeholder?: string;
}
