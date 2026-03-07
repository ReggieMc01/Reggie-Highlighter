import React from 'react';
import { Link } from 'react-router-dom';
import { colors, fonts } from '../theme';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { cart } = useCart();
  const { logout } = useUser();
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.accent, padding: '1.2rem 2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: '1.5rem', color: colors.primary }}>
        Dong Reggie&apos;s Brewery
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link to="/menu" style={{ color: colors.text, fontFamily: fonts.body, fontWeight: 600, textDecoration: 'none', fontSize: '1.08rem' }}>Menu</Link>
        <Link to="/orders" style={{ color: colors.text, fontFamily: fonts.body, fontWeight: 600, textDecoration: 'none', fontSize: '1.08rem' }}>My Orders</Link>
        <Link to="/admin" style={{ color: colors.text, fontFamily: fonts.body, fontWeight: 600, textDecoration: 'none', fontSize: '1.08rem' }}>Admin</Link>
        <Link to="/" onClick={logout} style={{ color: colors.primary, fontFamily: fonts.body, fontWeight: 600, textDecoration: 'none', fontSize: '1.08rem' }}>Logout</Link>
        <div style={{ position: 'relative', marginLeft: 18 }}>
          <span style={{ fontSize: 22, color: colors.primary }}>🛒</span>
          {cart.length > 0 && <span style={{ position: 'absolute', top: -8, right: -10, background: colors.primary, color: '#fff', borderRadius: '50%', padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>{cart.length}</span>}
        </div>
      </div>
    </nav>
  );
}
