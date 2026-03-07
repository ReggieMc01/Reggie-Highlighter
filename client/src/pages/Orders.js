import React, { useEffect, useState } from 'react';
import { colors, fonts } from '../theme';
import { useUser } from '../context/UserContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/orders?user_id=${user.id}`)
      .then(res => res.json())
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'));
  }, [user]);

  return (
    <div style={{ maxWidth: 900, margin: '3rem auto', padding: '2rem', background: colors.card, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontFamily: fonts.heading, color: colors.text, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>My Orders</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: colors.accent }}>
            <th>Items</th><th>Total</th><th>Status</th><th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #E8F4FD' }}>
              <td><pre style={{ fontSize: 13 }}>{order.items}</pre></td>
              <td>₱{order.total}</td>
              <td>{order.status}</td>
              <td>{order.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
