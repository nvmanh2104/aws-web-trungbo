import React from 'react';

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,25,44,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 7500, padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
    boxShadow: '0 8px 48px rgba(0,0,0,0.22)', maxHeight: '85vh',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '20px 28px 16px', borderBottom: '1px solid #ccd8e8',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
  },
  body: { padding: '20px 28px', overflowY: 'auto' },
  row: { display: 'flex', gap: 8, marginBottom: 12, alignItems: 'baseline' },
  rowLabel: { fontSize: 12, fontWeight: 600, color: '#7a94a8', width: 140, flexShrink: 0 },
  rowVal: { fontSize: 13, color: '#12263a', flex: 1 },
  badge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 99,
    background: '#e8f1fb', color: '#0d3b6e', fontSize: 11, fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
  },
  levelBadge: (lvl) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
    background: lvl === 0 ? '#fef4e3' : lvl === 1 ? '#e8f1fb' : '#eaf7f0',
    color: lvl === 0 ? '#a37411' : lvl === 1 ? '#0d3b6e' : '#1b7a4a',
    fontSize: 11, fontWeight: 700,
  }),
};

export default function StationGroupDetail({ open, group, onClose, onEdit }) {
  if (!open || !group) return null;

  const fmt = (val) => val || <span style={{ color: '#a8bdd4' }}>—</span>;
  const fmtDate = (d) => d
    ? new Date(d).toLocaleString('vi-VN')
    : <span style={{ color: '#a8bdd4' }}>—</span>;

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0d3b6e' }}>Chi tiết nhóm trạm</span>
            <span style={{ ...s.badge, marginLeft: 10 }}>{group.Code}</span>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7a94a8' }}>
            ✕
          </button>
        </div>

        <div style={s.body}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#7a94a8',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
          }}>
            Thông tin cơ bản
          </div>

          <div style={s.row}>
            <span style={s.rowLabel}>Tên nhóm</span>
            <span style={{ ...s.rowVal, fontWeight: 600, fontSize: 14 }}>{fmt(group.Name)}</span>
          </div>
          <div style={s.row}>
            <span style={s.rowLabel}>Mã nhóm</span>
            <span style={s.rowVal}><span style={s.badge}>{group.Code}</span></span>
          </div>
          <div style={s.row}>
            <span style={s.rowLabel}>Cấp độ</span>
            <span style={s.rowVal}>
              <span style={s.levelBadge(group.Level)}>Level {group.Level ?? 0}</span>
            </span>
          </div>
          <div style={s.row}>
            <span style={s.rowLabel}>Nhóm cha</span>
            <span style={s.rowVal}>
              {group.ParentCode
                ? <span style={s.badge}>{group.ParentCode}</span>
                : <span style={{ color: '#a8bdd4' }}>— (cấp gốc)</span>}
            </span>
          </div>
          <div style={s.row}>
            <span style={s.rowLabel}>Mô tả</span>
            <span style={s.rowVal}>{fmt(group.Description)}</span>
          </div>

          <div style={{
            fontSize: 11, fontWeight: 700, color: '#7a94a8',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginTop: 20, marginBottom: 14,
          }}>
            Thời gian
          </div>

          <div style={s.row}>
            <span style={s.rowLabel}>Ngày tạo</span>
            <span style={s.rowVal}>{fmtDate(group.CreatedAt)}</span>
          </div>
          <div style={s.row}>
            <span style={s.rowLabel}>Cập nhật gần nhất</span>
            <span style={s.rowVal}>{fmtDate(group.UpdatedAt)}</span>
          </div>
        </div>

        <div style={{
          padding: '14px 28px 20px', borderTop: '1px solid #ccd8e8',
          display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #ccd8e8',
            background: '#f5f8fc', color: '#3d5a72', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Đóng</button>
          <button onClick={onEdit} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#0d3b6e', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>✏️ Chỉnh sửa</button>
        </div>
      </div>
    </div>
  );
}
