import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

const VERIFY = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export default function VerifyEmail() {
  const [search] = useSearchParams();
  const token = search.get('token');
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');

  const [verifyEmail] = useMutation(VERIFY, {
    onCompleted: () => setStatus('ok'),
    onError: () => setStatus('error'),
  });

  useEffect(() => {
    if (token) verifyEmail({ variables: { token } });
    else setStatus('error');
  }, [token, verifyEmail]);

  if (status === 'pending') return <div className="container center">Verifying…</div>;
  if (status === 'ok') return <div className="container center">Email verified. You can now log in.</div>;
  return <div className="container center">Verification failed or token expired.</div>;
}
