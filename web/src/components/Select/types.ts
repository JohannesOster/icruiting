import {ChangeEvent, FocusEvent} from 'react';

export interface SelectProps {
  name?: string;
  label?: string;
  autoFocus?: boolean;
  description?: string;
  required?: boolean;
  errors?: Array<string>;
  options: Array<{label: string; value: string}>;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onBlur?(event: FocusEvent<HTMLSelectElement>): void;
  onFocus?(event: FocusEvent<HTMLSelectElement>): void;
  onChange?(event: ChangeEvent<HTMLSelectElement>): void;
}

export interface BaseSelectProps {
  error: boolean;
}

export interface LabelProps {
  error: boolean;
}

export interface DescriptionProps {
  error: boolean;
}
