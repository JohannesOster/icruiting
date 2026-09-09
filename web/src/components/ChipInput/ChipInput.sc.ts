import styled, {css} from 'styled-components';
import {
  LabelProps,
  DescriptionProps,
  ChipContainerProps,
  BaseChipInpusProps,
} from './types';

export const Container = styled.div`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale200};
`;

export const ChipContainer = styled.div<ChipContainerProps>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid;
  border-color: ${({theme}) => theme.colors.inputBorder};
  border-radius: ${({theme}) => theme.borders.radius100};
  background: ${({theme}) => theme.colors.inputFill};

  &:focus-within {
    border-color: ${({theme}) => theme.colors.inputBorderFocus};
  }

  ${({theme, error}) =>
    error &&
    css`
      border-color: ${theme.colors.inputBorderError};
      background-color: ${theme.colors.inputFillErrorFocus};

      &:focus-within {
        border-color: ${theme.colors.inputBorderError};
        background-color: ${theme.colors.inputFill};
      }
    `}
`;

export const BaseChipInput = styled.input<BaseChipInpusProps>`
  flex: 1;
  border: none;
  padding: ${({theme}) => theme.spacing.scale300};
  ${({theme}) => theme.typography.bodySmall};

  &:focus {
    outline: none;
    border: none;
  }

  ${({theme, error}) =>
    error &&
    css`
      background-color: ${theme.colors.inputFillErrorFocus};

      &:focus {
        background-color: ${theme.colors.inputFill};
      }
    `}
`;

export const Chip = styled.span`
  padding: ${({theme}) =>
    `${theme.spacing.scale100} ${theme.spacing.scale200}`};
  background: ${({theme}) => theme.colors.chipBackground};
  color: white;
  margin: ${({theme}) => `${theme.spacing.scale200} ${theme.spacing.scale200}`};
  display: inline-grid;
  grid-auto-flow: column;
  grid-column-gap: ${({theme}) => theme.spacing.scale200};
  ${({theme}) => theme.typography.body};
  border-radius: ${({theme}) => theme.borders.radius100};
`;

export const ChipCloseBtn = styled.span`
  cursor: pointer;
`;

export const Label = styled.label<LabelProps>`
  ${({theme}) => theme.typography.body};
  color: ${({theme, error}) =>
    error ? theme.colors.typographyPrimaryError : theme.colors.textDefault};
`;

export const Description = styled.span<DescriptionProps>`
  ${({theme}) => theme.typography.bodySmall};
  color: ${({theme, error}) =>
    error ? theme.colors.typographySecondaryError : theme.colors.textSubdued};
`;

export const Errors = styled.div`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale200};
  color: ${({theme}) => theme.colors.typographyPrimaryError};
  ${({theme}) => theme.typography.bodySmall};
`;
