import styled from 'styled-components';
import {SpinnerProps} from './types';

export const Spinner = styled.span<SpinnerProps>`
  height: ${({size, theme}) => size || theme.spacing.scale500};
  width: ${({size, theme}) => size || theme.spacing.scale500};
  border-radius: 50%;
  border: 3px solid;
  box-sizing: border-box;

  border-color: ${({theme, background}) =>
    background || theme.colors.surfacePrimarySubdued};
  border-top-color: ${({theme, foreground}) =>
    foreground || theme.colors.surfacePrimaryDefault};

  @keyframes spinnerAnimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  display: inline-block;
  animation-duration: ${({theme}) => theme.animations.timing800};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-name: spinnerAnimation;
`;
