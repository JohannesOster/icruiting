import {useAuth} from 'context';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {useRouter} from 'next/router';
import React, {FC} from 'react';

interface Options {
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function withAuth<T>(
  Component: FC,
  {requireAdmin = false, redirectTo = '/login'}: Options = {},
) {
  return hoistNonReactStatics((props: T) => {
    const {currentUser, isAuthenticating} = useAuth();
    const router = useRouter();

    if (isAuthenticating) return <></>;
    if (!currentUser) {
      router.replace(redirectTo);
      return <></>;
    }
    if (requireAdmin && currentUser.userRole !== 'admin') {
      router.replace(redirectTo);
      return <></>;
    }

    return <Component {...props} />;
  }, Component);
}

export function withAdmin<T>(Component: FC) {
  return hoistNonReactStatics(
    withAuth(Component, {requireAdmin: true}),
    Component,
  );
}
