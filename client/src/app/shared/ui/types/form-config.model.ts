interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local';
  value: any;
  placeholder?: string;
  validators?: any[];
  disabled?: boolean;
  select?: {options: { value: string; viewValue: string }[], config?: { avatars: boolean }};
  optional?: boolean
}
export type FormConfig = FormField[]