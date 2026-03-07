import React, { useEffect, useState } from 'react';
import { colors, fonts } from '../theme';
import { useCart, useUser } from '../context/CartContext';
import CartPanel from '../components/CartPanel';

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState('');
  const [orderMsg, setOrderMsg] = useState('');
  const { addToCart, cart, total, clearCart } = useCart();
  const { user } = useUser();

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(setMenu)
      .catch(() => setError('Failed to load menu.'));
  }, []);

  const handlePlaceOrder = async () => {
    if (!user) return setOrderMsg('You must be logged in to order.');
    const user_id = user.id;
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, items: cart, total })
      });
      if (!res.ok) throw new Error('Order failed');
      setOrderMsg('Your order is brewing — something wonderful is on its way.');
      clearCart();
    } catch {
      setOrderMsg('Failed to place order.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '3rem auto', padding: '2rem', background: colors.card, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontFamily: fonts.heading, color: colors.text, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Menu</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 40, height: 2, background: colors.accent, marginBottom: 8, borderRadius: 2 }} />
        <div style={{ fontFamily: fonts.heading, fontStyle: 'italic', color: colors.quote, fontSize: '1.1rem', textAlign: 'center' }}>
          "Good food, great coffee, and the best company."
        </div>
        <div style={{ width: 40, height: 2, background: colors.accent, marginTop: 8, borderRadius: 2 }} />
      </div>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {orderMsg && <div style={{ fontFamily: fonts.heading, fontStyle: 'italic', color: colors.quote, fontSize: '1.1rem', margin: '2rem 0', borderTop: '1px solid #B3D9F2', borderBottom: '1px solid #B3D9F2', padding: '1rem 0', textAlign: 'center' }}>{orderMsg}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {menu.map(item => (
          <div key={item.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: 'min(220px, 90vw)', padding: '1.2rem', textAlign: 'center', transition: 'transform 0.2s', fontFamily: fonts.body }}>
            <div style={{ fontWeight: 700, fontFamily: fonts.heading, fontSize: '1.2rem', marginBottom: 8 }}>{item.name}</div>
            <div style={{ color: colors.accent, fontSize: '0.95rem', marginBottom: 8 }}>{item.category}</div>
            <div style={{ fontSize: '0.98rem', marginBottom: 8 }}>{item.description}</div>
            <div style={{ fontWeight: 600, color: colors.primary, fontSize: '1.1rem', marginBottom: 8 }}>₱{item.price}</div>
            <button onClick={() => addToCart(item)} style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontFamily: fonts.heading, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Add to Order</button>
          </div>
        ))}
      </div>
      <CartPanel onPlaceOrder={handlePlaceOrder} />
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 600px) {
          .menu-card { width: 98vw !important; }
          .cart-panel { width: 100vw !important; position: static !important; }
        }
      `}</style>
    </div>
  );
}
