import {ReactNode, MouseEvent} from 'react';

export type ButtonKind = 'primary' | 'secondary' | 'minimal';

export interface BaseButtonProps {
  isLoading?: boolean;
  kind?: ButtonKind;
  destructive?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface ButtonProps extends BaseButtonProps {
  children?: ReactNode;
}
