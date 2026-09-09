import styled from 'styled-components';
import {Arrow} from 'icons';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  z-index: 10;
  ${({theme}) => theme.typography.body};
`;

export const Overlay = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  pointer-events: none;
  display: none;

  transition: opacity 0.1s ease, transform 0.05s ease-in-out;
  transform: translateX(5px);

  ${Container}:hover & {
    pointer-events: auto;
    opacity: 1;
    display: block;
    transform: translateX(0);
  }
`;

export const Content = styled.div`
  background: white;
  margin-top: 10px;
  box-shadow: 1px 1px 5px 0px rgba(64, 64, 64, 0.3);
`;

export const Icon = styled(Arrow)`
  height: 12px;
  width: auto;
  display: inline-block;
  transform: rotate(90deg);

  transition: transform 0.1s ease-in-out;

  ${Container}:hover & {
    transform: rotate(-90deg);
  }
`;
