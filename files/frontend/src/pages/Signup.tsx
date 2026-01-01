import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { isValidEmail, isStrongPassword } from '../utils/validators';

const SIGNUP = gql`
  mutation Signup($first: String!, $last: String!, $email: String!, $password: String!) {
    signup(firstName: $first, lastName: $last, email: $email, password: $password) {
      token
      user { id email }
    }
  }
`;

export default function Signup() {
  const navigate = useNavigate();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [doSignup, { loading }] = useMutation(SIGNUP, {
    onCompleted: (data) => {
      const token = data?.signup?.token;
      if (token) {
        // If you move to httpOnly cookies server-side, remove localStorage.
        localStorage.setItem('token', token);
      }
      navigate('/admin');
    },
    onError: (err) => {
      // Show a concise, safe error
      setError(err.message || 'Signup failed. Please try again.');
    },
  });

  // Basic client-side validation summary
  const canSubmit = useMemo(() => {
    if (!first.trim() || !last.trim()) return false;
    if (!isValidEmail(email.trim())) return false;
    if (!isStrongPassword(pw)) return false;
    if (pw !== pw2) return false;
    return true;
  }, [first, last, email, pw, pw2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent double-submit race
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedFirst = first.trim();
    const trimmedLast = last.trim();

    if (!isValidEmail(trimmedEmail)) return setError('Enter a valid email.');
    if (!isStrongPassword(pw)) {
      return setError('Password must be 8+ chars and include upper, lower, and a number.');
    }
    if (pw !== pw2) return setError('Passwords do not match.');

    doSignup({
      variables: {
        first: trimmedFirst,
        last: trimmedLast,
        email: trimmedEmail,
        password: pw,
      },
    });
  };

  return (
    <div className="container center">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, marginRight: 10 }}>
            <input
              type="text"
              placeholder="First Name"
              required
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              autoComplete="given-name"
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={last}
              onChange={(e) => setLast(e.target.value)}
              autoComplete="family-name"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div style={{ flex: 1, marginLeft: 10 }}>
            <input
              type="password"
              placeholder="Password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <button type="submit" disabled={loading || !canSubmit}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      {error && <div style={{ color: 'darkred', marginTop: 8 }}>{error}</div>}
      <p>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#0866ff', textDecoration: 'none' }}>Log In</Link>
      </p>
    </div>
  );
}
