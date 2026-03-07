import React, { useState } from 'react';
import { colors, fonts } from '../theme';

export default function ChangePassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setSuccess('Password updated! You can now log in.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', background: colors.card, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2.5rem', textAlign: 'center' }}>
      <div style={{ fontFamily: fonts.heading, fontStyle: 'italic', color: colors.quote, fontSize: '1.1rem', marginBottom: '2rem', borderTop: '1px solid #B3D9F2', borderBottom: '1px solid #B3D9F2', padding: '1rem 0' }}>
        "A fresh start, just like a fresh cup."
      </div>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
        <input type="password" placeholder="Confirm New Password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
        <button type="submit" style={{ width: '100%', background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem', fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(74,144,196,0.08)' }}>Update Password</button>
      </form>
    </div>
  );
}
