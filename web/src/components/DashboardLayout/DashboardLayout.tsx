import React from 'react';
import {IcruitingLogo, Users, World, Portfolio, Settings, Logout, Account} from 'icons';
import {useTheme} from 'styled-components';
import {useAuth} from 'context';
import {
  SideNav,
  NavList,
  Container,
  LogoContainer,
  MobiltTabBar,
  MobileTabBarItem,
} from './DashboardLayout.sc';
import {NavLink} from './NavLink';
import Link from 'next/link';
import {Box} from 'components';
import {useRouter} from 'next/router';

const DashboardLayout = ({children}) => {
  const {colors, spacing} = useTheme();
  const {currentUser} = useAuth();
  const router = useRouter();

  const iconsStyles = {
    marginRight: spacing.scale200,
    height: spacing.scale400,
    width: spacing.scale400,
    color: colors.textDefault,
  };

  const tabBarIconStyles = {
    height: spacing.scale500,
    width: spacing.scale500,
  };

  const tabIconFill = (path: string) => {
    return router.pathname.includes(path) ? colors.textPrimary : colors.textDefault;
  };

  return (
    <>
      <SideNav>
        <LogoContainer>
          <Link href="/">
            <IcruitingLogo
              style={{
                width: '110px',
                height: 'auto',
                marginBottom: -10,
                fill: colors.textPrimary,
              }}
            />
          </Link>
        </LogoContainer>
        <Box display="flex" flexDirection="column" justifyContent="space-between" flex={1}>
          {currentUser?.userRole === 'admin' ? (
            <NavList>
              <NavLink href="/dashboard/jobs">
                <Portfolio style={iconsStyles} />
                Stellen
              </NavLink>
              <NavLink href="/dashboard/applicants">
                <Users style={iconsStyles} />
                Bewerbungen
              </NavLink>
              <NavLink href="/dashboard/members">
                <World style={iconsStyles} />
                Mitarbeiter:innen
              </NavLink>
            </NavList>
          ) : (
            <NavList>
              <NavLink href="/dashboard/applicants">
                <Users style={iconsStyles} />
                Bewerbungen
              </NavLink>
            </NavList>
          )}
          <NavList>
            <NavLink href="/dashboard/account">
              <Account style={iconsStyles} />
              Account
            </NavLink>
            <NavLink href="/logout">
              <Logout style={iconsStyles} />
              Abmelden
            </NavLink>
            {currentUser?.userRole === 'admin' && (
              <NavLink href="/dashboard/settings">
                <Settings style={iconsStyles} />
                Einstellungen
              </NavLink>
            )}
            <Box
              borderTop={`1px solid ${colors.borderSubdued}`}
              padding={`${spacing.scale200} ${spacing.scale500}`}
              fontSize={13}
              textOverflow="ellipsis"
              overflow="hidden"
            >
              {currentUser?.email}
            </Box>
          </NavList>
        </Box>
      </SideNav>
      <Container>{children}</Container>
      <MobiltTabBar>
        {currentUser?.userRole === 'admin' && (
          <MobileTabBarItem>
            <Link href="/dashboard/jobs">
              <Portfolio style={tabBarIconStyles} fill={tabIconFill('jobs')} />
            </Link>
          </MobileTabBarItem>
        )}

        <MobileTabBarItem>
          <Link href="/dashboard/applicants">
            <Users style={tabBarIconStyles} fill={tabIconFill('/applicants')} />
          </Link>
        </MobileTabBarItem>

        {currentUser?.userRole === 'admin' && (
          <MobileTabBarItem>
            <Link href="/dashboard/members">
              <World style={tabBarIconStyles} fill={tabIconFill('/members')} />
            </Link>
          </MobileTabBarItem>
        )}

        <MobileTabBarItem>
          <Link href="/dashboard/account">
            <Account style={tabBarIconStyles} fill={tabIconFill('/dashboard/account')} />
          </Link>
        </MobileTabBarItem>

        {currentUser?.userRole === 'admin' && (
          <MobileTabBarItem>
            <Link href="/dashboard/settings">
              <Settings style={tabBarIconStyles} fill={tabIconFill('/settings')} />
            </Link>
          </MobileTabBarItem>
        )}
      </MobiltTabBar>
    </>
  );
};

const getDashboardLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export {DashboardLayout, getDashboardLayout};
