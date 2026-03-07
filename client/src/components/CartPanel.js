import React from 'react';
import { useCart } from '../context/CartContext';
import { colors, fonts } from '../theme';

export default function CartPanel({ onPlaceOrder }) {
  const { cart, updateQty, removeFromCart, total, clearCart } = useCart();

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, width: 340, height: '100vh', background: colors.card, boxShadow: '-2px 0 12px rgba(0,0,0,0.08)', padding: '2rem 1.5rem', zIndex: 1000 }}>
      <h3 style={{ fontFamily: fonts.heading, color: colors.text, fontSize: '1.3rem', marginBottom: '1.2rem' }}>Order Summary</h3>
      {cart.length === 0 ? <div style={{ color: colors.text }}>Cart is empty.</div> : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.map(item => (
              <li key={item.id} style={{ marginBottom: 18, borderBottom: '1px solid #E8F4FD', paddingBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: colors.accent, fontSize: '0.95rem' }}>{item.category}</div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                  <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} style={{ marginRight: 8, border: 'none', background: colors.accent, color: '#fff', borderRadius: 6, width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>-</button>
                  <span style={{ fontFamily: fonts.body, fontSize: 16 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ marginLeft: 8, border: 'none', background: colors.accent, color: '#fff', borderRadius: 6, width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 16, border: 'none', background: 'transparent', color: colors.primary, fontSize: 16, cursor: 'pointer' }}>Remove</button>
                </div>
                <div style={{ color: colors.primary, fontWeight: 600, marginTop: 4 }}>₱{(item.price * item.qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '1.2rem 0' }}>Total: ₱{total.toFixed(2)}</div>
          <button onClick={onPlaceOrder} style={{ width: '100%', background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem', fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(74,144,196,0.08)' }}>Place Order</button>
          <button onClick={clearCart} style={{ width: '100%', background: colors.accent, color: colors.text, border: 'none', borderRadius: 8, padding: '0.7rem', fontFamily: fonts.body, fontWeight: 500, fontSize: '1rem', cursor: 'pointer', marginTop: 10 }}>Clear Cart</button>
        </>
      )}
    </div>
  );
}
