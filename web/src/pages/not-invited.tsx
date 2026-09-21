import React from 'react';
import Link from 'next/link';
import {Box, HeadingS, Typography} from 'components';
import {useAuth} from 'context';
import {useTheme} from 'styled-components';

/**
 * Where `withAuth` sends a logged-in user whose account belongs to no organisation — in practice
 * someone who signed in with Google before being invited (JO-63/JO-67).
 */
const NotInvited: React.FC = () => {
  const {spacing} = useTheme();
  const {currentUser} = useAuth();

  return (
    <Box margin="0 auto" padding="132px 0" maxWidth="600px">
      <Box display="grid" rowGap={spacing.scale500}>
        <HeadingS>Noch keine Einladung</HeadingS>
        <Typography kind="body">
          Es sieht so aus, als wäre{' '}
          {currentUser?.email ? <b>{currentUser.email}</b> : 'dieser Account'} noch keiner
          Organisation zugeordnet.
        </Typography>
        <Typography kind="body">
          Bitte wenden Sie sich an den Administrator Ihrer Organisation, damit Sie eingeladen
          werden. Sobald die Einladung vorliegt, können Sie sich hier anmelden.
        </Typography>
        <Typography kind="secondary">
          <Link href="/logout">Abmelden</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default NotInvited;
