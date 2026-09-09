import {FocusEvent, ChangeEvent} from 'react';

export interface TextareaProps {
  name?: string;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  description?: string;
  required?: boolean;
  errors?: Array<string>;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onBlur?(event: FocusEvent<HTMLTextAreaElement>): void;
  onFocus?(event: FocusEvent<HTMLTextAreaElement>): void;
  onChange?(event: ChangeEvent<HTMLTextAreaElement>): void;
}

export interface BaseTextareaProps {
  error: boolean;
}

export interface LabelProps {
  error: boolean;
}

export interface DescriptionProps {
  error: boolean;
}
