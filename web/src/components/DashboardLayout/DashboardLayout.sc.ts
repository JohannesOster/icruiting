import styled, {css} from 'styled-components';

export const SideNav = styled.aside`
  background: white;
  border-right: 1px solid ${({theme}) => theme.colors.inputBorder};
  width: 220px;
  position: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;


  box-shadow: 0px 0px 2px rgba(130, 136, 148, 0.16), 0px 4px 6px rgba(130, 136, 148, 0.16);

  a {
    text-decoration: none;
    ${({theme}) => theme.typography.body};
    &:hover  {
      text-decoration: none;
    }
  }

  ${({theme}) => css`
    @media (max-width: ${theme.breakpoints.md}) {
      display: none;
    }
  `}}
`;

export const LogoContainer = styled.div`
  height: 80px;
  display: flex;
  padding: ${({theme}) => `0 ${theme.spacing.scale500}`};
  cursor: pointer;
  z-index: 25;
  border-bottom: 1px solid ${({theme}) => theme.colors.borderSubdued};
  height: 80px !important;
  align-items: center;
`;

export const NavList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Container = styled.main`
  padding: ${({theme}) => theme.spacing.scale500};
  padding-left: 244px;
  padding-bottom: ${({theme}) => theme.spacing.scale300};
  background: ${({theme}) => theme.colors.surfaceSubdued};
  min-height: 100vh;

  ${({theme}) => css`
    @media (max-width: ${theme.breakpoints.md}) {
      padding-left: ${theme.spacing.scale500};
      padding-bottom: 72px; // 56px + 16px
    }
  `};
`;

export const MobiltTabBar = styled.div`
  display: none;
  height: 56px;
  width: 100%;
  position: fixed;
  bottom: 0;
  z-index: 100;
  border-top: 1px solid ${({theme}) => theme.colors.borderSubdued};
  background: ${({theme}) => theme.colors.surfaceDefault};

  ${({theme}) => css`
    @media (max-width: ${theme.breakpoints.md}) {
      display: flex;
    }
  `};
`;

export const MobileTabBarItem = styled.div`
  flex: 1;

  > * {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
