import React from 'react';

export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(12,30,50,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: '28px 32px',
        maxWidth: 400, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>⚠️</div>
        <p style={{ fontSize: 15, color: '#12263a', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #ccd8e8',
            background: '#f5f8fc', color: '#3d5a72', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}>Huỷ</button>
          <button onClick={onConfirm} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#b5261e', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>Xoá</button>
        </div>
      </div>
    </div>
  );
}
