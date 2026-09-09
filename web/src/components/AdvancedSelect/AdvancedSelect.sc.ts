import {getInputGroupContainerStyles} from 'components/InputGroupContainer';
import styled from 'styled-components';

export const ConentContainer = styled.div`
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: ${({theme}) => theme.spacing.scale600};
  padding: ${({theme}) => `${theme.spacing.scale200} ${theme.spacing.scale300}`};

  border: 1px solid ${({theme}) => theme.colors.inputBorder};
  border-radius: ${({theme}) => theme.borders.radius100};
  background: white;

  ${({theme}) => theme.typography.bodySmall};

  transition-property: border-color box-shadow;
  transition-duration: ${({theme}) => theme.animations.timing100};
  transition-timing-function: ${({theme}) => theme.animations.linearCurve};
`;

export const Container = styled.div`
  position: relative;
  ${getInputGroupContainerStyles(ConentContainer)}

  &:focus-within ${ConentContainer} {
    border-color: ${({theme}) => theme.colors.focus};
    box-shadow: ${({theme}) => theme.shadows.focus};
    border-inline-end-width: 1px;
    z-index: 2;
  }
`;

export const Select = styled.select`
  ${({theme}) => theme.typography.bodySmall};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 30;
  width: 100%;
  height: 100%;
  opacity: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
`;

export const Label = styled.label`
  ${({theme}) => theme.typography.bodySmall};
  color: ${({theme}) => theme.colors.textSubdued};

  white-space: no-wrap;
`;
