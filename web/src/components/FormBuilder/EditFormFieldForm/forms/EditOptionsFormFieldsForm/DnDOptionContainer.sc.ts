import styled from 'styled-components';

export const ActionBar = styled.div`
  background: white;
  box-shadow: 1px 1px 5px 0px rgba(64, 64, 64, 0.3);
  border-radius: ${({theme}) => theme.borders.radius100};
  display: grid;
  grid-auto-flow: column;

  div {
    height: ${({theme}) => theme.spacing.scale600};
    width: ${({theme}) => theme.spacing.scale600};
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const OptionContainer = styled.div`
  display: flex;
  align-items: center;
`;
