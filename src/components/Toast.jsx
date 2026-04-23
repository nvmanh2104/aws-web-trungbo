import React, { useEffect } from 'react';

const styles = {
  wrapper: {
    position: 'fixed', top: 20, right: 20, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  toast: (type) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 18px', borderRadius: 10, minWidth: 280, maxWidth: 380,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.2s ease',
    background: type === 'success' ? '#1b7a4a' : type === 'error' ? '#b5261e' : '#0d3b6e',
    color: '#fff', fontSize: 13, fontWeight: 500,
  }),
  icon: { fontSize: 16, flexShrink: 0 },
};

export default function Toast({ toasts, remove }) {
  return (
    <div style={styles.wrapper}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      {toasts.map(t => <ToastItem key={t.id} toast={t} remove={remove} />)}
    </div>
  );
}

function ToastItem({ toast, remove }) {
  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ';
  return (
    <div style={styles.toast(toast.type)}>
      <span style={styles.icon}>{icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}
