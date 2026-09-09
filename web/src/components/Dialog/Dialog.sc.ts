import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.4);
  z-index: 30;
`;

export const Container = styled.div`
  box-sizing: border-box;
  background: white;
  position: absolute;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 500px;
  border-radius: ${({theme}) => theme.borders.radius100};

  @media (max-width: 568px) {
    overflow: scroll;
    max-height: 100vh;
    height: 100vh;
    width: 100vw;
  }
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => `${theme.spacing.scale400} ${theme.spacing.scale600}`};
  border-bottom: 1px solid ${({theme}) => theme.colors.borderSubdued};
`;

export const DialogBody = styled.section`
  padding: ${({theme}) => `${theme.spacing.scale400} ${theme.spacing.scale600}`};
`;

export const DialogFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => `${theme.spacing.scale400} ${theme.spacing.scale600}`};
  border-top: 1px solid ${({theme}) => theme.colors.borderSubdued};
`;

export const Close = styled.span`
  display: flex;
  cursor: pointer;
  padding: ${({theme}) => theme.spacing.scale200};

  svg {
    stroke: black;
    stroke-width: 3px;
    height: 25px;
    width: 25px;
  }
`;
