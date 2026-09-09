import React, {useState, useEffect} from 'react';
import {
  Header,
  DesktopNav,
  NavItem,
  MobileNav,
  DropDownItem,
  MobileNavItem,
  Hamburger,
  NavContainer,
} from './Navbar.sc';
import {DropDown, Typography, Box} from 'components';
import {Button} from 'components';
import {IcruitingLogo, UserCircle, Logout} from 'icons';
import {useTheme} from 'styled-components';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useAuth} from 'context';
import config from 'config';
import {theme} from 'theme';

const Navbar = () => {
  const {spacing, colors} = useTheme();
  const router = useRouter();
  const {currentUser, logout, isAuthenticating} = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (menuOpen) {
      // https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
      // to avoid scrolling under mobile menu
      document.body.style.position = 'fixed';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // reset back to default
      const scrollY = document.body.style.top;
      document.body.style.position = 'relative';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const unauthenticatedMobileNav = (
    <>
      <Box>
        <MobileNavItem onClick={closeMenu}>
          <a href="https://docs.icruiting.at">Dokumentation</a>
        </MobileNavItem>
        <MobileNavItem onClick={closeMenu}>
          <Link href="/#contact">Kontakt</Link>
        </MobileNavItem>
      </Box>
      <Box textAlign="center">
        <MobileNavItem onClick={closeMenu} style={{borderBottom: 'none'}}>
          <Link href="/login">Anmelden</Link>
        </MobileNavItem>
        <MobileNavItem
          onClick={closeMenu}
          style={{
            background: colors.surfacePrimaryDefault,
            color: colors.textOnDark,
            border: 'none',
          }}
        >
          <Link href="/signup">Registrieren</Link>
        </MobileNavItem>
      </Box>
    </>
  );

  const authenticatedMobileNav = (
    <>
      <Box>
        <MobileNavItem onClick={closeMenu}>
          <a href="https://docs.icruiting.at" rel="noopener noreferrer" target="_blank">
            Dokumentation
          </a>
        </MobileNavItem>
        <MobileNavItem onClick={closeMenu}>
          <Link href="/dashboard">Dashboard</Link>
        </MobileNavItem>
      </Box>
      <Box>
        <MobileNavItem onClick={closeMenu}>
          <Link href="/dashboard/account">Account</Link>
        </MobileNavItem>
        <MobileNavItem onClick={closeMenu}>
          <Link href="/#contact">Kontakt</Link>
        </MobileNavItem>
        <MobileNavItem onClick={closeMenu}>
          <Link href="/logout">Abmelden</Link>
        </MobileNavItem>
      </Box>
    </>
  );

  const unauthenticatedDesktopNav = (
    <>
      <NavItem>
        <a href="https://docs.icruiting.at" rel="noopener noreferrer" target="_blank">
          Dokumentation
        </a>
      </NavItem>
      <NavItem>
        <Link href="/#contact">Kontakt</Link>
      </NavItem>
      <NavItem>
        <Link href="/login">Anmelden</Link>
      </NavItem>
      <NavItem>
        <Button onClick={() => router.push('/signup')}>Registrieren</Button>
      </NavItem>
    </>
  );

  const authenticatedDesktopNav = (
    <>
      <NavItem>
        <a href="https://docs.icruiting.at" rel="noopener noreferrer" target="_blank">
          Dokumentation
        </a>
      </NavItem>
      <NavItem>
        <Link href="/#contact">Kontakt</Link>
      </NavItem>
      <NavItem>
        <Link href="/dashboard">Dashboard</Link>
      </NavItem>
      <NavItem>
        <DropDown label={currentUser?.email || 'Account'}>
          <Box position="relative">
            <Link href="/dashboard/account">
              <DropDownItem>
                <UserCircle style={{width: '1em', marginRight: spacing.scale200}} />
                Account
              </DropDownItem>
            </Link>
            <Link href="/logout">
              <DropDownItem>
                <Logout style={{width: '1em', marginRight: spacing.scale200}} />
                Abmelden
              </DropDownItem>
            </Link>
          </Box>
        </DropDown>
      </NavItem>
    </>
  );

  return (
    <Header>
      <div style={{zIndex: 25, cursor: 'pointer'}} onClick={closeMenu}>
        <Link href="/">
          <IcruitingLogo
            style={{
              width: '110px',
              height: 'auto',
              marginBottom: -10,
              fill: theme.colors.textPrimary,
            }}
          />
        </Link>
      </div>
      {!isAuthenticating && (
        <>
          <NavContainer style={{marginLeft: 'auto'}}>
            <Hamburger open={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <span></span>
              <span></span>
              <span></span>
            </Hamburger>
            <DesktopNav>
              {currentUser ? authenticatedDesktopNav : unauthenticatedDesktopNav}
            </DesktopNav>
          </NavContainer>
          <MobileNav open={menuOpen}>
            {currentUser ? authenticatedMobileNav : unauthenticatedMobileNav}
          </MobileNav>
        </>
      )}
    </Header>
  );
};

export {Navbar};
