import styled, {css, DefaultTheme} from 'styled-components';
import {ButtonKind, BaseButtonProps} from './types';
import {getInputGroupContainerStyles} from 'components/InputGroupContainer';

export const BaseButton = styled.button<BaseButtonProps>`
  display: inline-flex;
  flex-direction: ${({isLoading}) => (isLoading ? 'column' : 'row')};
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;

  padding-top: ${({theme}) => theme.spacing.scale200};
  padding-bottom: ${({theme}) => theme.spacing.scale200};
  padding-left: ${({theme}) => theme.spacing.scale400};
  padding-right: ${({theme}) => theme.spacing.scale400};

  border: none;
  border-radius: ${({theme}) => theme.borders.radius100};

  ${({theme}) => theme.typography.button}

  transition-property: background-color color;
  transition-duration: ${({theme}) => theme.animations.timing100};
  transition-timing-function: ${({theme}) => theme.animations.linearCurve};

  ${({isLoading}) =>
    isLoading &&
    css`
      pointer-events: none;
    `}

  ${({theme, kind, destructive}) => getButtonStylesForKind(theme, kind, destructive)};

  ${getInputGroupContainerStyles()}
`;

export const LoadingSpinnerContainer = styled.div`
  position: static;
  line-height: 0;
`;

const getButtonStylesForKind = (
  theme: DefaultTheme,
  kind: ButtonKind = 'primary',
  destructive?: boolean,
) => {
  switch (kind) {
    case 'minimal':
      return css`
        background: none;
        color: ${destructive ? theme.colors.typographyPrimaryError : theme.colors.textDefault};
        padding: 0;

        &:hover {
          color: ${destructive ? theme.colors.typographySecondaryError : theme.colors.textSubdued};
        }

        &:disabled {
          cursor: not-allowed;
          color: ${theme.colors.buttonMinimalDisabledText};
        }
      `;
    case 'secondary':
      return css`
        border: 1px solid;
        border-color: ${destructive ? theme.colors.borderDanger : theme.colors.borderPrimary};
        background-color: ${theme.colors.surfaceDefault};
        color: ${destructive
          ? theme.colors.buttonPrimaryDestructiveText
          : theme.colors.textPrimary};

        &:hover {
          background-color: ${destructive
            ? theme.colors.buttonPrimaryDestructiveFillHover
            : theme.colors.surfacePrimarySubdued};
        }

        &:disabled {
          cursor: not-allowed;
          background-color: ${theme.colors.surfacePrimaryDisabled};
          color: ${theme.colors.textDisabled};
          border-color: transparent;
        }

        &:active {
          background-color: ${theme.colors.surfacePrimarySubdued};
        }
      `;
    default:
      return css`
        background-color: ${destructive
          ? theme.colors.buttonPrimaryDestructiveFill
          : theme.colors.surfacePrimaryDefault};
        color: ${destructive ? theme.colors.buttonPrimaryDestructiveText : theme.colors.textOnDark};

        &:hover {
          background-color: ${destructive
            ? theme.colors.buttonPrimaryDestructiveFillHover
            : theme.colors.surfacePrimaryHover};
        }

        &:disabled {
          cursor: not-allowed;
          background-color: ${theme.colors.surfacePrimaryDisabled};
          color: ${theme.colors.textDisabled};
        }

        &:active {
          background-color: ${theme.colors.surfacePrimaryActive};
        }
      `;
  }
};
