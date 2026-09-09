import styled from 'styled-components';
import {LabelProps, DescriptionProps} from './types';

export const Container = styled.div`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale200};
`;

export const OptionContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  grid-column-gap: ${({theme}) => theme.spacing.scale200};
`;

export const OptionLabel = styled.label`
  ${({theme}) => theme.typography.bodySmall};
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
