import React, {useMemo, useRef} from 'react';
import {createCtx} from './createCtx';
import {AnalyticsBrowser} from '@segment/analytics-next';

interface AuthContext {
  analytics: AnalyticsBrowser;
}

const [useCtx, CtxProvider] = createCtx<AuthContext>();

const AnalyticsProvider = (props) => {
  const writeKey = useRef(process.env.NEXT_PUBLIC_SEGMENT_WRITEKEY);
  const analytics = useMemo(() => AnalyticsBrowser.load({writeKey: writeKey.current}), []);
  return <CtxProvider value={{analytics}} {...props} />;
};

export {AnalyticsProvider, useCtx as useAnalytics};
