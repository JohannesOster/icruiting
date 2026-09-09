import React, {useEffect} from 'react';
import {useTheme} from 'styled-components';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {Box, Button, DisplayL, Typography} from 'components';
import {Bunny} from 'icons';

import styled, {css} from 'styled-components';
import {useAnalytics} from 'context';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 75px); // 75px = navbarheight;
`;

export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  padding: ${({theme}) => theme.spacing.scale500};
  color: ${({theme}) => theme.colors.textSubdued};
  border-top: 1px solid;
  border-color: ${({theme}) => theme.colors.inputBorder};
  ${({theme}) => theme.typography.body};

  @media (max-width: ${({theme}) => theme.breakpoints.xs}) {
    display: block;
  }
`;

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({theme}) => theme.spacing.scale600};
  height: 100vh;
  max-width: 790px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({theme}) => theme.spacing.scale600};

  ${({theme}) => css`
    @media (max-width: ${theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
`;

const LandingPage: React.FC = () => {
  const {spacing} = useTheme();
  const router = useRouter();

  return (
    <>
      <Container>
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          paddingBottom={96}
          paddingLeft={spacing.scale400}
          paddingRight={spacing.scale400}
          maxWidth={1280}
          width="100%"
          margin="0 auto"
        >
          {/* HERO */}
          <Hero>
            <Box display="flex" flexDirection="column" gap={spacing.scale200}>
              <DisplayL>
                Wähle die <b>passensten</b> nicht die besten Mitarbeiter:innen.
              </DisplayL>
              <Typography kind="body" color="secondary">
                Eine Plattform, die Euch dabei unterstützt, kollaborativ und anforderungsgetrieben
                Hiring-Entscheidungen zu treffen.
              </Typography>
            </Box>
            <Box>
              <Button onClick={() => router.push('/signup')}>Registrieren</Button>
            </Box>
          </Hero>
        </Box>
        <Footer style={{position: 'relative'}}>
          <Bunny
            style={{
              position: 'absolute',
              top: '-25px',
              right: spacing.scale500,
              transform: 'scaleX(-1)',
              height: '25px',
              width: 'auto',
            }}
          />
          <Link href="/">icruiting.at</Link>
          <Box display="grid" gridAutoFlow="column" columnGap={spacing.scale300}>
            <Link href="/impressum">Impressum</Link>
            <span>&bull;</span>
            <Link href="/privacy">Datenschutzerklärung</Link>
          </Box>
        </Footer>
      </Container>
    </>
  );
};

export default LandingPage;
