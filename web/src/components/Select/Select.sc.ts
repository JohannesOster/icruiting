import styled from 'styled-components';
import {LabelProps, DescriptionProps} from './types';

export const BaseSelect = styled.select`
  border: 1px solid ${({theme}) => theme.colors.inputBorder};
  border-radius: ${({theme}) => theme.borders.radius100};
  background: white;
  cursor: pointer;
  outline: none;
  // width: 100%; commented out since currently these two lines shrink filtering select in applicants overview
  width: auto;
  // min-width: 50px;
  padding: ${({theme}) => `${theme.spacing.scale200} ${theme.spacing.scale300}`};
  padding-right: ${({theme}) => theme.spacing.scale700};

  ${({theme}) => theme.typography.bodySmall};

  &:focus {
    border-color: ${({theme}) => theme.colors.focus};
    box-shadow: ${({theme}) => theme.shadows.focus};
    border-inline-end-width: 1px;
    outline: 0;
    z-index: 100;
  }

  transition-property: border-color box-shadow;
  transition-duration: ${({theme}) => theme.animations.timing100};
  transition-timing-function: ${({theme}) => theme.animations.linearCurve};

  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  background: url("data:image/svg+xml,%3Csvg width='6' height='10' viewBox='0 0 6 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.32374 4H0.676264C0.113017 4 -0.202493 3.39719 0.145493 2.98592L2.46923 0.239557C2.73949 -0.0798525 3.26051 -0.0798525 3.53077 0.239557L5.85451 2.98592C6.20249 3.39719 5.88698 4 5.32374 4Z' fill='%236D7175'/%3E%3Cpath d='M0.676263 6L5.32374 6C5.88698 6 6.20249 6.60281 5.85451 7.01408L3.53077 9.76044C3.26051 10.0799 2.73949 10.0799 2.46923 9.76044L0.145493 7.01408C-0.202494 6.60281 0.113017 6 0.676263 6Z' fill='%236D7175'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: right ${({theme}) => theme.spacing.scale200} top 50%;
  background-color: ${({theme}) => theme.colors.surfaceDefault};
`;

export const Container = styled.div`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale200};
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
