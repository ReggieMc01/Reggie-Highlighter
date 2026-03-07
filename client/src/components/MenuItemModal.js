import React, { useState } from 'react';
import { colors, fonts } from '../theme';

export default function MenuItemModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'Coffee');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [image_url, setImageUrl] = useState(initial?.image_url || '');

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: colors.card, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', padding: '2rem', minWidth: 320, maxWidth: '90vw' }}>
        <h3 style={{ fontFamily: fonts.heading, color: colors.primary, marginBottom: 18 }}>{initial ? 'Edit' : 'Add'} Menu Item</h3>
        <form onSubmit={e => { e.preventDefault(); onSave({ name, category, description, price: parseFloat(price), image_url }); }}>
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }}>
            <option value="Coffee">Coffee</option>
            <option value="Bread">Bread</option>
            <option value="Doughnut">Doughnut</option>
            <option value="Cake">Cake</option>
          </select>
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
          <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
          <input type="text" placeholder="Image URL" value={image_url} onChange={e => setImageUrl(e.target.value)} style={{ width: '100%', marginBottom: 18, padding: 8, borderRadius: 8, border: '1px solid #B3D9F2', fontFamily: fonts.body }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ background: colors.accent, color: colors.text, border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontFamily: fonts.body, fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontFamily: fonts.heading, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }}>{initial ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
