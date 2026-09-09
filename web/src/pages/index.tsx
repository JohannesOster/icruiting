import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from 'styled-components';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {Box, Button, DisplayL, HeadingM, Input, Textarea, Typography} from 'components';
import {Bunny} from 'icons';
import {useForm} from 'react-hook-form';

import styled, {css} from 'styled-components';
import config from 'config';
import {useAnalytics, useToaster} from 'context';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers';
import {errorsFor} from 'utils/react-hook-form-errors-for';

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
  const formRef = useRef<HTMLFormElement>();
  const {success, danger} = useToaster();
  const [loading, setLoading] = useState(false);

  const {handleSubmit, register, formState, errors} = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: yupResolver(
      object({
        name: string().required('Bitte gibt Deinen Namen ein.'),
        email: string().email('Bitte gib eine gültige E-Mail-Adresse an.'),
        message: string().required('Bitte gibt Deine Nachricht ein.'),
      }),
    ),
  });

  const _onSubmit = (values) => {
    setLoading(true);
    const msg = `*${values.name} (${values.email}) wrote:*\n${values.message}`;
    fetch(config.discordContactWebHook, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content: msg}),
    })
      .then(() => {
        success('Nachricht erfolgreich gesendet!');
        formRef.current.reset();
      })
      .catch(() => {
        danger('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
          {/* CONTACT */}
          {/* <Box
            id="contact"
            display="flex"
            flexDirection="column"
            alignItems="start"
            gap={spacing.scale600}
          >
            <Box>
              <HeadingM>Kontakt</HeadingM>
              <Typography color="secondary">Wir antworten schnell 🏃</Typography>
            </Box>
            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.scale400,
                width: '100%',
              }}
              ref={formRef}
              onSubmit={handleSubmit(_onSubmit)}
            >
              <Input
                label="Name"
                placeholder="Name"
                name="name"
                ref={register({required: true})}
                errors={errorsFor(errors, 'name')}
              />
              <Input
                label="E-Mail-Adresse"
                placeholder="E-Mail-Adresse"
                name="email"
                ref={register({required: true})}
                type="email"
                errors={errorsFor(errors, 'email')}
              />
              <Textarea
                label="Nachricht"
                placeholder="Nachricht"
                name="message"
                ref={register({required: true})}
                errors={errorsFor(errors, 'message')}
              />
              <Box>
                <Button
                  type="submit"
                  disabled={!(formState.isDirty && formState.isValid)}
                  isLoading={loading}
                >
                  Senden
                </Button>
              </Box>
            </form>
          </Box> */}
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
