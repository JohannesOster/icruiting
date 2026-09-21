import React from 'react';
import Link from 'next/link';
import {Box, HeadingS, Typography} from 'components';
import {useAuth} from 'context';
import {useTheme} from 'styled-components';

export const CONTACT_EMAIL = 'johannes.oster@icruiting.at';

/**
 * Self-service signup is disabled (JO-67). This page tells people how to get access instead,
 * and is also where users without an organisation (e.g. a Google login that was never invited)
 * are sent by `withAuth`.
 */
const SignUp: React.FC = () => {
  const {spacing} = useTheme();
  const {currentUser} = useAuth();

  return (
    <Box margin="0 auto" padding="132px 0" maxWidth="600px">
      <Box display="grid" rowGap={spacing.scale500}>
        <HeadingS>Registrierung nicht möglich</HeadingS>
        <Typography kind="body">
          Neue Organisationen können derzeit nicht selbst registriert werden.
        </Typography>
        <Typography kind="body">
          Verwendet Ihre Organisation icruiting bereits? Dann bitten Sie den Administrator Ihrer
          Organisation, Sie einzuladen. Sie erhalten dann eine E-Mail mit Ihren Zugangsdaten.
        </Typography>
        <Typography kind="body">
          Sie benötigen eine neue Organisation? Schreiben Sie uns an{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> oder über{' '}
          <Link href="/#contact">Kontakt</Link>.
        </Typography>
        {currentUser && !currentUser.tenantId && (
          <Typography kind="secondary">
            Der Account <b>{currentUser.email}</b> ist noch keiner Organisation zugeordnet.{' '}
            <Link href="/logout">Abmelden</Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SignUp;
