import React, { useState } from 'react';
import { colors, fonts } from '../theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      // TODO: Redirect to /menu or /admin
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', background: colors.card, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem', textAlign: 'center' }}>
      <h1 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: '2.2rem', marginBottom: '1.2rem', color: colors.text }}>Dong Reggie&apos;s Brewery</h1>
      <div style={{ fontFamily: fonts.heading, fontStyle: 'italic', color: colors.quote, fontSize: '1.1rem', marginBottom: '2rem', borderTop: '1px solid #B3D9F2', borderBottom: '1px solid #B3D9F2', padding: '1rem 0' }}>
        &quot;Every great day starts with a great cup.&quot;
      </div>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem', fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(74,144,196,0.08)' }}>Sign In</button>
      </form>
      <div style={{ marginTop: '1.5rem', fontSize: '0.98rem' }}>
        <a href="/register" style={{ color: colors.primary, textDecoration: 'underline', marginRight: 12 }}>Create Account</a>
        <a href="/change-password" style={{ color: colors.primary, textDecoration: 'underline' }}>Forgot Password / Change Password</a>
      </div>
    </div>
  );
}
