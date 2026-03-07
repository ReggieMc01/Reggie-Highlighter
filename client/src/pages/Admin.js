import React, { useEffect, useState } from 'react';
import { colors, fonts } from '../theme';
import MenuItemModal from '../components/MenuItemModal';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'));
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(setMenu)
      .catch(() => setError('Failed to load menu.'));
  }, []);

  const notifyCustomer = (id) => {
    // Simulate notification
    setOrders(orders => orders.map(o => o.id === id ? { ...o, status: 'Notified' } : o));
    alert('Customer notified!');
  };

  const deleteMenuItem = (id) => {
    fetch(`http://localhost:5000/api/menu/${id}`, { method: 'DELETE' })
      .then(() => setMenu(menu => menu.filter(item => item.id !== id)));
  };

  const openAddModal = () => { setEditItem(null); setModalOpen(true); };
  const openEditModal = (item) => { setEditItem(item); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const saveMenuItem = (item) => {
    if (editItem) {
      // Edit existing
      fetch(`http://localhost:5000/api/menu/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
        .then(() => setMenu(menu => menu.map(m => m.id === editItem.id ? { ...m, ...item } : m)));
    } else {
      // Add new
      fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
        .then(res => res.json())
        .then(data => setMenu(menu => [...menu, { ...item, id: data.id }]));
    }
    setModalOpen(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '3rem auto', padding: '2rem', background: colors.card, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontFamily: fonts.heading, color: colors.text, fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Admin Dashboard</h2>
      <div style={{ fontFamily: fonts.heading, fontStyle: 'italic', color: colors.quote, fontSize: '1.1rem', marginBottom: '2rem', borderTop: '1px solid #B3D9F2', borderBottom: '1px solid #B3D9F2', padding: '1rem 0', textAlign: 'center' }}>
        "Behind every great café is a great owner."
      </div>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <h3 style={{ fontFamily: fonts.heading, color: colors.primary, marginTop: 32 }}>Orders</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <thead>
          <tr style={{ background: colors.accent }}>
            <th>Name</th><th>Email</th><th>Items</th><th>Total</th><th>Status</th><th>Timestamp</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #E8F4FD' }}>
              <td>{order.name}</td>
              <td>{order.email}</td>
              <td><pre style={{ fontSize: 13 }}>{order.items}</pre></td>
              <td>₱{order.total}</td>
              <td>{order.status}</td>
              <td>{order.timestamp}</td>
              <td><button onClick={() => notifyCustomer(order.id)} style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontFamily: fonts.body, fontWeight: 600, cursor: 'pointer' }}>Notify Customer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ fontFamily: fonts.heading, color: colors.primary, marginTop: 32 }}>Menu Items</h3>
      <button onClick={openAddModal} style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontFamily: fonts.heading, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: 18 }}>Add New Item</button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menu.map(item => (
          <li key={item.id} style={{ marginBottom: 18, borderBottom: '1px solid #E8F4FD', paddingBottom: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{item.name}</span> — <span style={{ color: colors.accent }}>{item.category}</span> — ₱{item.price}
            <button onClick={() => openEditModal(item)} style={{ marginLeft: 8, background: colors.accent, color: colors.text, border: 'none', borderRadius: 8, padding: '0.3rem 0.8rem', fontFamily: fonts.body, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
            <button onClick={() => deleteMenuItem(item.id)} style={{ marginLeft: 8, background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.8rem', fontFamily: fonts.body, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
          </li>
        ))}
      </ul>
      <MenuItemModal open={modalOpen} onClose={closeModal} onSave={saveMenuItem} initial={editItem} />
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          ul { padding: 0 2vw; }
        }
      `}</style>
    </div>
  );
}
