'use client';

import { UrqlProvider as Provider, ssrExchange, cacheExchange, fetchExchange, createClient } from '@urql/next';
import { useMemo } from 'react';

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange();
    const client = createClient({
      url: 'http://localhost:3002/graphql',
      exchanges: [cacheExchange, ssr, fetchExchange],
      suspense: true,
    });
    return [client, ssr];
  }, []);

  return (
    <Provider client={client} ssr={ssr}>
      {children}
    </Provider>
  );
}
