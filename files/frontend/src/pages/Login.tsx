import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id email }
    }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [doLogin, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      if (data?.login?.token) localStorage.setItem('token', data.login.token);
      navigate('/admin');
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    doLogin({ variables: { email, password: pw } });
  };

  return (
    <div className="container center">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Log In'}</button>
      </form>
      {error && <div style={{ color: 'darkred', marginTop: 8 }}>{error}</div>}
      <p><Link to="/forgot-password" style={{ color: '#0866ff', textDecoration: 'none' }}>Forgot password?</Link></p>
      <p>New? <Link to="/signup" style={{ color: '#0866ff', textDecoration: 'none' }}>Get started</Link></p>
    </div>
  );
}
