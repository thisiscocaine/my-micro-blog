import { ReactNode } from 'react';
import { gql, useQuery } from '@apollo/client';

const ME = gql`query Me { me { id role email } }`;

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { data, loading, error } = useQuery(ME, { fetchPolicy: 'cache-and-network' });
  if (loading) return <div className="container">Checking auth…</div>;
  if (error || !data?.me || data.me.role !== 'ADMIN') return <div className="container">Forbidden</div>;
  return <>{children}</>;
}