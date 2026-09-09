import React, {useState, useEffect, useCallback} from 'react';
import {createCtx} from './createCtx';
import {API, User} from 'services';
import {useAnalytics} from './AnalyticsCtx';

interface AuthContext {
  isAuthenticating: boolean;
  currentUser?: User;
  refetchUser: () => void;
  logout: () => Promise<void>;
}

const [useCtx, CtxProvider] = createCtx<AuthContext>();

const AuthProvider = (props) => {
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const {analytics} = useAnalytics();

  const refetchUser = useCallback(() => {
    return API.auth
      .currentUser()
      .then((user) => {
        setCurrentUser(user);
        analytics.identify(user.userId, {
          email: user.email,
          company: {id: user.tenantId},
          role: user.userRole,
        });
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  useEffect(() => {
    refetchUser().then(() => setIsAuthenticating(false));
  }, [refetchUser]);

  const logout = async () => {
    await API.auth.logout();
    return refetchUser();
  };

  return <CtxProvider value={{isAuthenticating, currentUser, refetchUser, logout}} {...props} />;
};

export {AuthProvider, useCtx as useAuth};
