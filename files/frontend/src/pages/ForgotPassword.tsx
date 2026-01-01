import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { isValidEmail } from '../utils/validators';

const REQUEST_RESET = gql`
  mutation RequestReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requestReset, { loading }] = useMutation(REQUEST_RESET, {
    onCompleted: () => setMsg('If that email exists, a reset link was sent.'),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMsg(null);
    if (!isValidEmail(email)) return setError('Enter a valid email.');
    requestReset({ variables: { email } });
  };

  return (
    <div className="container center">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Reset Password'}</button>
      </form>
      {error && <div style={{ color: 'darkred', marginTop: 8 }}>{error}</div>}
      {msg && <div style={{ color: 'green', marginTop: 8 }}>{msg}</div>}
      <p>Remember your password? <Link to="/login" style={{ color: '#0866ff', textDecoration: 'none' }}>Log In</Link></p>
    </div>
  );
}
