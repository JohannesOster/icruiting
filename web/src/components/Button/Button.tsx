import React, {MouseEvent} from 'react';
import {useTheme} from 'styled-components';
import {ButtonProps} from './types';
import {BaseButton, LoadingSpinnerContainer} from './Button.sc';
import {Spinner} from '../Spinner';

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  const {colors, spacing} = useTheme();

  const _onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    if (!onClick) return;
    onClick(event);
  };

  return (
    <BaseButton isLoading={isLoading} disabled={disabled} onClick={_onClick} type={type} {...props}>
      <span
        style={
          isLoading
            ? {opacity: 0, height: 0}
            : {display: 'flex', alignItems: 'center', justifyContent: 'center'}
        }
      >
        {children}
      </span>
      {isLoading && (
        <LoadingSpinnerContainer>
          <Spinner
            size="20px"
            {...(disabled
              ? {}
              : {
                  foreground: colors.surfacePrimaryDefault,
                  background: colors.surfacePrimarySubdued,
                })}
          />
        </LoadingSpinnerContainer>
      )}
    </BaseButton>
  );
};
