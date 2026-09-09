import {ChangeEvent, FocusEvent, KeyboardEvent} from 'react';

export type InputType =
  | 'file'
  | 'text'
  | 'color'
  | 'tel'
  | 'url'
  | 'number'
  | 'email'
  | 'password'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'time';

export interface InputProps {
  name?: string;
  type?: InputType;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  description?: string;
  required?: boolean;
  errors?: string[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  accept?: string;
  step?: string | number;
  onBlur?(event: FocusEvent<HTMLInputElement>): void;
  onFocus?(event: FocusEvent<HTMLInputElement>): void;
  onChange?(event: ChangeEvent<HTMLInputElement>): void;
  onKeyPress?(event: KeyboardEvent): void;
}

export interface BaseInputProps {
  error: boolean;
  type?: InputType;
}

export interface LabelProps {
  error: boolean;
}

export interface DescriptionProps {
  error: boolean;
}
