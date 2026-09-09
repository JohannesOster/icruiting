import React, {useEffect} from 'react';
import {theme} from 'theme';
import {createGlobalStyle, ThemeProvider} from 'styled-components';
import Amplify from 'aws-amplify';
import config from 'amplify.config';
import {AuthProvider, useAuth} from 'context';
import {Box, Navbar, Spinner} from 'components';
import {ToasterProvider} from 'context';

import 'styles/normalize.css';
import 'styles/reset.locals.css';
import 'styles/typography.css';
import {useRouter} from 'next/router';
import {AnalyticsProvider, useAnalytics} from 'context/AnalyticsCtx';

Amplify.configure({...config, ssr: true});

const GlobalStyles = createGlobalStyle`
  body {
    ${({theme}) => theme.typography.body};
    color: ${({theme}) => theme.colors.textDefault};
  };
`;

const App = ({Component, pageProps}) => {
  const {isAuthenticating} = useAuth();
  const router = useRouter();
  const {analytics} = useAnalytics();

  const getLayout =
    Component.getLayout ||
    ((page) => (
      <>
        <Navbar />
        {page}
      </>
    ));

  useEffect(() => {
    const handleRouteChange = () => analytics.page();
    if (document.referrer === '') handleRouteChange();

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ThemeProvider theme={theme}>
      <ToasterProvider>
        <GlobalStyles />
        {/* <Navbar /> */}
        {isAuthenticating ? (
          <Box
            height="100vh"
            width="100vw"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner />
          </Box>
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
      </ToasterProvider>
    </ThemeProvider>
  );
};

const Wrapper = (props) => {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <App {...props} />
      </AuthProvider>
    </AnalyticsProvider>
  );
};

export default Wrapper;
