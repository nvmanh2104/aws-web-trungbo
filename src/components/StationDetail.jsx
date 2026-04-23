import React from 'react';

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,25,44,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 7500, padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620,
    boxShadow: '0 8px 48px rgba(0,0,0,0.22)', maxHeight: '88vh',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '20px 28px 16px', borderBottom: '1px solid #ccd8e8',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
  },
  body: { padding: '20px 28px', overflowY: 'auto' },
  sectionTitle: {
    fontSize: 11, fontWeight: 700, color: '#7a94a8',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
  },
  row: { display: 'flex', gap: 8, marginBottom: 10, alignItems: 'baseline' },
  rowLabel: { fontSize: 12, fontWeight: 600, color: '#7a94a8', width: 150, flexShrink: 0 },
  rowVal: { fontSize: 13, color: '#12263a', flex: 1 },
  badge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 99,
    background: '#e8f1fb', color: '#0d3b6e', fontSize: 11, fontWeight: 700,
  },
  ftpCard: {
    border: '1px solid #ccd8e8', borderRadius: 10, padding: 14,
    background: '#f5f8fc', marginBottom: 10,
  },
  ftpTitle: {
    fontSize: 11, fontWeight: 700, color: '#1a5fa8', marginBottom: 10,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  mono: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#0d3b6e' },
  simCard: {
    border: '1px solid #d4edda', borderRadius: 10, padding: 14,
    background: '#f0faf2', marginBottom: 16,
  },
};

export default function StationDetail({ open, station, onClose, onEdit }) {
  if (!open || !station) return null;

  const fmt = (val) => val || <span style={{ color: '#a8bdd4' }}>—</span>;
  const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : <span style={{ color: '#a8bdd4' }}>—</span>;

  // Helpers để đọc field mới
  const nameVN = station.StationName?.VN || station.StationName?.EN || '';
  const nameEN = station.StationName?.EN || '';
  const regionVN = station.Region?.VN || station.Region?.EN || '';
  const addrVN = station.Address?.VN;
  const addrEN = station.Address?.EN;
  const addressStr = addrVN
    ? [addrVN.Ward, addrVN.District, addrVN.Province].filter(Boolean).join(', ')
    : addrEN
      ? [addrEN.Ward, addrEN.District, addrEN.Province].filter(Boolean).join(', ')
      : '';

  // SIM card
  const sim = station.SimCard;
  const simExpired = sim?.ExpiredAt ? new Date(sim.ExpiredAt) < new Date() : false;

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0d3b6e' }}>Chi tiết trạm</span>
            <span style={{ ...s.badge, marginLeft: 10 }}>{station.StationID}</span>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7a94a8' }}>✕</button>
        </div>

        <div style={s.body}>

          {/* Thông tin cơ bản */}
          <div style={{ marginBottom: 20 }}>
            <div style={s.sectionTitle}>Thông tin trạm</div>
            <div style={s.row}>
              <span style={s.rowLabel}>Tên trạm (VN)</span>
              <span style={{ ...s.rowVal, fontWeight: 600 }}>{fmt(nameVN)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Tên trạm (EN)</span>
              <span style={s.rowVal}>{fmt(nameEN)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Khu vực</span>
              <span style={s.rowVal}>{fmt(regionVN)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Dự án</span>
              <span style={s.rowVal}>{fmt(station.Project)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Nhóm trạm</span>
              <span style={s.rowVal}>{fmt(station.StationGroupCode)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Loại mặc định</span>
              <span style={s.rowVal}>{fmt(station.DefaultType)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Tọa độ</span>
              <span style={{ ...s.rowVal, ...s.mono }}>
                {station.Lat != null && station.Lon != null
                  ? `${station.Lat}, ${station.Lon}`
                  : <span style={{ color: '#a8bdd4' }}>—</span>}
              </span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Địa chỉ</span>
              <span style={s.rowVal}>{fmt(addressStr)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Số điện thoại</span>
              <span style={s.rowVal}>{fmt(station.phone_number)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Ngày nạp dữ liệu</span>
              <span style={s.rowVal}>{fmtDate(station.recharge_date)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Tạo lúc</span>
              <span style={s.rowVal}>{fmtDate(station.created_at)}</span>
            </div>
            <div style={s.row}>
              <span style={s.rowLabel}>Cập nhật lúc</span>
              <span style={s.rowVal}>{fmtDate(station.updated_at)}</span>
            </div>
          </div>

          {/* SIM Card */}
          {sim?.PhoneNumber && (
            <div style={{ marginBottom: 20 }}>
              <div style={s.sectionTitle}>SIM Card</div>
              <div style={s.simCard}>
                <div style={s.row}>
                  <span style={s.rowLabel}>Số điện thoại</span>
                  <span style={{ ...s.rowVal, ...s.mono }}>{sim.PhoneNumber}</span>
                </div>
                <div style={s.row}>
                  <span style={s.rowLabel}>Ngày nạp</span>
                  <span style={s.rowVal}>{fmtDate(sim.ChargedAt)}</span>
                </div>
                <div style={s.row}>
                  <span style={s.rowLabel}>Hết hạn</span>
                  <span style={{ ...s.rowVal, color: simExpired ? '#b5261e' : '#1a7a3a', fontWeight: 600 }}>
                    {fmtDate(sim.ExpiredAt)} {simExpired ? '⚠️ Hết hạn' : '✅'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FTP Servers */}
          {station.ftp_list?.length > 0 && (
            <div>
              <div style={s.sectionTitle}>FTP Servers ({station.ftp_list.length})</div>
              {station.ftp_list.map((ftp, i) => (
                <div key={i} style={s.ftpCard}>
                  <div style={s.ftpTitle}>Server #{i + 1}</div>
                  <div style={s.row}>
                    <span style={s.rowLabel}>Host</span>
                    <span style={{ ...s.rowVal, ...s.mono }}>{fmt(ftp.ftp_host)}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.rowLabel}>Port</span>
                    <span style={{ ...s.rowVal, ...s.mono }}>{ftp.ftp_port || '—'}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.rowLabel}>Username</span>
                    <span style={{ ...s.rowVal, ...s.mono }}>{fmt(ftp.ftp_user)}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.rowLabel}>Password</span>
                    <span style={{ ...s.rowVal, ...s.mono }}>{'•'.repeat(ftp.ftp_pass?.length || 0) || '—'}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.rowLabel}>Thư mục</span>
                    <span style={{ ...s.rowVal, ...s.mono }}>{fmt(ftp.ftp_directory)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px 20px', borderTop: '1px solid #ccd8e8', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #ccd8e8', background: '#f5f8fc', color: '#3d5a72', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Đóng
          </button>
          <button onClick={onEdit}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0d3b6e', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Chỉnh sửa
          </button>
        </div>

      </div>
    </div>
  );
}