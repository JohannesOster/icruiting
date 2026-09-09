import styled, {css} from 'styled-components';

export const Header = styled.header`
  height: 80px;
  width: 100%;
  padding: ${({theme}) => `0 ${theme.spacing.scale500}`};
  border: 1px solid;
  border-color: ${({theme}) => theme.colors.inputBorder};
  border-top: none;
  border-right: none;
  border-left: none;
  display: flex;
  align-items: center;
  position: relative;
  position: fixed;
  background: ${({theme}) => theme.colors.surfaceDefault};
  z-index: 100;

  a {
    text-decoration: none;
    ${({theme}) => theme.typography.body};

    &:hover {
      text-decoration: none;
    }
  }
`;

export const NavContainer = styled.div`
  margin-left: auto;
  position: relative;
  display: flex;
`;

export const Hamburger = styled.div<{open: boolean}>`
  height: ${({theme}) => theme.spacing.scale500};
  width: ${({theme}) => theme.spacing.scale600};
  z-index: 20;
  position: relative;

  span {
    display: block;
    position: absolute;
    left: 0;
    height: 2px;
    width: 100%;
    background: ${({theme}) => theme.colors.textDefault};
    transition-timing-function: ease;
    transition-duration: 0.15s;
    :nth-child(1) {
      top: 0;
      transform: ${({open}) => (open ? 'translateY(8px) rotate(45deg)' : 'rotate(0)')};
    }
    :nth-child(2) {
      top: 8px;
      opacity: ${({open}) => (open ? '0' : '1')};
    }
    :nth-child(3) {
      top: 16px;
      transform: ${({open}) => (open ? 'translateY(-8px) rotate(-45deg)' : 'rotate(0)')};
    }
  }

  ${({theme}) => css`
    @media (min-width: ${theme.breakpoints.md}) {
      display: none;
    }
  `}
`;

export const MobileNavItem = styled.div`
  border-bottom: 1px solid ${({theme}) => theme.colors.borderSubdued};
  > * {
    display: block;
    padding: ${({theme}) => `${theme.spacing.scale400} ${theme.spacing.scale500}`};
  }
`;

export const MobileNav = styled.nav<{open: boolean}>`
  padding-top: 80px; // header height
  z-index: 10;
  background: white;
  position: fixed;
  justify-content: stretch;
  align-content: start;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: ${({open}) => (open ? '1' : '0')};
  pointer-events: ${({open}) => (open ? 'all' : 'none')};

  transition: opacity 0.1s ease-in-out;

  ${MobileNavItem}:first-child {
    margin-top: -1px;
    display: block;
    border-top: 1px solid ${({theme}) => theme.colors.borderSubdued};
  }

  ${({theme}) => css`
    @media (min-width: ${theme.breakpoints.md}) {
      display: none;
    }
  `};
`;

export const DesktopNav = styled.ul`
  list-style: none;
  align-items: center;
  display: none;

  ${({theme}) => css`
    @media (min-width: ${theme.breakpoints.md}) {
      display: flex;
    }
  `};
`;

export const NavItem = styled.li`
  cursor: pointer;
  margin-right: 30px;
  &:last-child {
    margin: 0;
  }
`;

export const DropDownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  line-height: 0;
  padding: ${({theme}) => theme.spacing.scale500};

  &:hover {
    background: rgba(235, 235, 235, 0.25);
  }
`;

export const Separator = styled.hr`
  background: ${({theme}) => theme.colors.inputBorder};
  border: none;
  width: 100%;
  height: 1px;
`;
