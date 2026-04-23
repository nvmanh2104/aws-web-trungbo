import React, { useEffect, useRef, useState } from 'react';

const EMPTY_FTP = { ftp_host: '', ftp_port: '', ftp_user: '', ftp_pass: '', ftp_directory: '' };

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,25,44,0.6)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 7000, overflowY: 'auto', padding: '24px 16px',
  },
  modal: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 760,
    boxShadow: '0 8px 48px rgba(0,0,0,0.22)', margin: 'auto',
  },
  header: {
    padding: '20px 28px 16px', borderBottom: '1px solid #ccd8e8',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  body: { padding: '24px 28px' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12, fontWeight: 700, color: '#7a94a8', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8,
    borderBottom: '1px solid #eef2f7',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 16px' },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#3d5a72' },
  ftpCard: {
    border: '1px solid #ccd8e8', borderRadius: 10, padding: 16,
    background: '#f5f8fc', marginBottom: 12, position: 'relative',
  },
  ftpTitle: { fontSize: 12, fontWeight: 700, color: '#0d3b6e', marginBottom: 12 },
  removeBtn: {
    position: 'absolute', top: 12, right: 12,
    background: '#fdecea', color: '#b5261e', border: 'none',
    borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
  },
  addFtpBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8, border: '1px dashed #a8bdd4',
    background: 'transparent', color: '#1a5fa8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  footer: {
    padding: '16px 28px 24px', display: 'flex',
    justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #ccd8e8',
  },
  btnCancel: {
    padding: '9px 22px', borderRadius: 8, border: '1px solid #ccd8e8',
    background: '#f5f8fc', color: '#3d5a72', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  btnSave: {
    padding: '9px 26px', borderRadius: 8, border: 'none',
    background: '#0d3b6e', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
};

if (!document.getElementById('aws-form-style')) {
  const tag = document.createElement('style');
  tag.id = 'aws-form-style';
  tag.textContent = `
    .aws-input {
      padding: 9px 12px; border-radius: 8px; border: 1px solid #ccd8e8;
      font-size: 13px; color: #12263a; outline: none; background: #f5f8fc;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .aws-input:focus { border-color: #1a5fa8; background: #fff; }
    .aws-input:disabled { background: #e8edf2; color: #7a94a8; cursor: not-allowed; }
    .aws-input-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  `;
  document.head.appendChild(tag);
}

const FtpCard = React.memo(({ id, index, initial, onRemove, showRemove }) => (
  <div style={s.ftpCard}>
    <div style={s.ftpTitle}>FTP Server #{index + 1}</div>
    {showRemove && (
      <button type="button" onClick={onRemove} style={s.removeBtn}>Xoá</button>
    )}
    <div style={s.grid2}>
      <div style={s.field}>
        <label style={s.label}>Host</label>
        <input name={`ftp_host_${id}`} className="aws-input aws-input-mono" defaultValue={initial.ftp_host} placeholder="192.168.1.1" />
      </div>
      <div style={s.field}>
        <label style={s.label}>Port</label>
        <input name={`ftp_port_${id}`} className="aws-input" type="number" defaultValue={initial.ftp_port} placeholder="21" />
      </div>
      <div style={s.field}>
        <label style={s.label}>Username</label>
        <input name={`ftp_user_${id}`} className="aws-input" defaultValue={initial.ftp_user} />
      </div>
      <div style={s.field}>
        <label style={s.label}>Password</label>
        <input name={`ftp_pass_${id}`} className="aws-input" type="password" defaultValue={initial.ftp_pass} />
      </div>
      <div style={{ ...s.field, gridColumn: '1 / -1' }}>
        <label style={s.label}>Thư mục</label>
        <input name={`ftp_directory_${id}`} className="aws-input aws-input-mono" defaultValue={initial.ftp_directory} placeholder="/data/aws" />
      </div>
    </div>
  </div>
));

export default function StationForm({ open, station, onClose, onSave }) {
  const [ftpItems, setFtpItems] = useState([{ id: 1, data: { ...EMPTY_FTP } }]);
  const [loading, setLoading] = useState(false);
  const nextId = useRef(2);
  const formRef = useRef();

  useEffect(() => {
    if (!open) return;
    nextId.current = 1;
    const list = station?.ftp_list?.length
      ? station.ftp_list.map(d => ({ id: nextId.current++, data: d }))
      : [{ id: nextId.current++, data: { ...EMPTY_FTP } }];
    setFtpItems(list);
  }, [open, station]);

  if (!open) return null;

  const addFtp = () => setFtpItems(prev => [...prev, { id: nextId.current++, data: { ...EMPTY_FTP } }]);
  const removeFtp = (id) => setFtpItems(prev => prev.filter(f => f.id !== id));

  const handleSubmit = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);

    const StationID = fd.get('StationID')?.trim();
    const nameVN = fd.get('StationName_VN')?.trim();
    const nameEN = fd.get('StationName_EN')?.trim();
    if (!StationID || !nameVN) {
      alert('Vui lòng nhập Mã trạm và Tên trạm (VN)!');
      return;
    }

    const ftp_list = ftpItems.map(({ id }) => ({
      ftp_host:      fd.get(`ftp_host_${id}`)        || '',
      ftp_port:      Number(fd.get(`ftp_port_${id}`)) || 21,
      ftp_user:      fd.get(`ftp_user_${id}`)        || '',
      ftp_pass:      fd.get(`ftp_pass_${id}`)        || '',
      ftp_directory: fd.get(`ftp_directory_${id}`)   || '',
    }));

    const recharge_date_raw = fd.get('recharge_date');
    const simCharged = fd.get('sim_charged');
    const simExpired = fd.get('sim_expired');

    const payload = {
      StationID,
      StationName: {
        VN: nameVN,
        EN: nameEN || nameVN,
      },
      Region: {
        VN: fd.get('Region_VN') || '',
        EN: fd.get('Region_EN') || '',
      },
      Project:          fd.get('Project')          || '',
      StationGroupCode: fd.get('StationGroupCode') || '',
      DefaultType:      fd.get('DefaultType')      || '',
      Lat:  parseFloat(fd.get('Lat'))  || 0,
      Lon:  parseFloat(fd.get('Lon'))  || 0,
      Address: {
        VN: {
          Province: fd.get('Province_VN') || '',
          District: fd.get('District_VN') || '',
          Ward:     fd.get('Ward_VN')     || '',
        },
        EN: {
          Province: fd.get('Province_EN') || '',
          District: fd.get('District_EN') || '',
          Ward:     fd.get('Ward_EN')     || '',
        },
      },
      SimCard: {
        PhoneNumber: fd.get('sim_phone') || '',
        ChargedAt:   simCharged ? new Date(simCharged).toISOString() : null,
        ExpiredAt:   simExpired ? new Date(simExpired).toISOString() : null,
      },
      phone_number:  fd.get('phone_number')  || '',
      recharge_date: recharge_date_raw ? new Date(recharge_date_raw).toISOString() : null,
      ftp_list,
    };

    setLoading(true);
    await onSave(payload);
    setLoading(false);
  };

  // Helper: đọc giá trị cũ khi edit
  const st = station;

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0d3b6e' }}>
            {st ? '✏️ Chỉnh sửa trạm' : '➕ Thêm trạm mới'}
          </span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7a94a8' }}>✕</button>
        </div>

        <form ref={formRef} onSubmit={e => e.preventDefault()} style={s.body}>

          {/* === Thông tin cơ bản === */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Thông tin trạm</div>
            <div style={s.grid2}>

              <div style={s.field}>
                <label style={s.label}>Mã trạm <span style={{ color: '#b5261e' }}>*</span></label>
                <input name="StationID" className="aws-input"
                  defaultValue={st?.StationID || ''}
                  disabled={!!st}
                  placeholder="VD: TB001"
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Dự án</label>
                <input name="Project" className="aws-input" defaultValue={st?.Project || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Tên trạm (VN) <span style={{ color: '#b5261e' }}>*</span></label>
                <input name="StationName_VN" className="aws-input" defaultValue={st?.StationName?.VN || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Tên trạm (EN)</label>
                <input name="StationName_EN" className="aws-input" defaultValue={st?.StationName?.EN || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Khu vực (VN)</label>
                <input name="Region_VN" className="aws-input" defaultValue={st?.Region?.VN || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Khu vực (EN)</label>
                <input name="Region_EN" className="aws-input" defaultValue={st?.Region?.EN || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Nhóm trạm</label>
                <input name="StationGroupCode" className="aws-input" defaultValue={st?.StationGroupCode || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Loại mặc định</label>
                <input name="DefaultType" className="aws-input" defaultValue={st?.DefaultType || ''} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Vĩ độ (Lat)</label>
                <input name="Lat" className="aws-input aws-input-mono" type="number" step="any"
                  defaultValue={st?.Lat ?? ''} placeholder="16.047" />
              </div>

              <div style={s.field}>
                <label style={s.label}>Kinh độ (Lon)</label>
                <input name="Lon" className="aws-input aws-input-mono" type="number" step="any"
                  defaultValue={st?.Lon ?? ''} placeholder="108.206" />
              </div>

            </div>
          </div>

          {/* === Địa chỉ === */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Địa chỉ</div>
            <div style={{ marginBottom: 10, fontSize: 11, color: '#7a94a8', fontWeight: 600 }}>🇻🇳 Tiếng Việt</div>
            <div style={{ ...s.grid3, marginBottom: 14 }}>
              <div style={s.field}>
                <label style={s.label}>Tỉnh / Thành phố</label>
                <input name="Province_VN" className="aws-input" defaultValue={st?.Address?.VN?.Province || ''} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Quận / Huyện</label>
                <input name="District_VN" className="aws-input" defaultValue={st?.Address?.VN?.District || ''} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phường / Xã</label>
                <input name="Ward_VN" className="aws-input" defaultValue={st?.Address?.VN?.Ward || ''} />
              </div>
            </div>
            <div style={{ marginBottom: 10, fontSize: 11, color: '#7a94a8', fontWeight: 600 }}>🇬🇧 English</div>
            <div style={s.grid3}>
              <div style={s.field}>
                <label style={s.label}>Province / City</label>
                <input name="Province_EN" className="aws-input" defaultValue={st?.Address?.EN?.Province || ''} />
              </div>
              <div style={s.field}>
                <label style={s.label}>District</label>
                <input name="District_EN" className="aws-input" defaultValue={st?.Address?.EN?.District || ''} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Ward</label>
                <input name="Ward_EN" className="aws-input" defaultValue={st?.Address?.EN?.Ward || ''} />
              </div>
            </div>
          </div>

          {/* === SIM Card === */}
          <div style={s.section}>
            <div style={s.sectionTitle}>SIM Card</div>
            <div style={s.grid3}>
              <div style={s.field}>
                <label style={s.label}>Số điện thoại SIM</label>
                <input name="sim_phone" className="aws-input" defaultValue={st?.SimCard?.PhoneNumber || ''} placeholder="09xxxxxxxx" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Ngày nạp tiền</label>
                <input name="sim_charged" className="aws-input" type="datetime-local"
                  defaultValue={st?.SimCard?.ChargedAt ? st.SimCard.ChargedAt.slice(0, 16) : ''} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Ngày hết hạn</label>
                <input name="sim_expired" className="aws-input" type="datetime-local"
                  defaultValue={st?.SimCard?.ExpiredAt ? st.SimCard.ExpiredAt.slice(0, 16) : ''} />
              </div>
            </div>
          </div>

          {/* === Thông tin khác === */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Thông tin liên hệ & dữ liệu</div>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>Số điện thoại liên hệ</label>
                <input name="phone_number" className="aws-input" defaultValue={st?.phone_number || ''} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Ngày nạp dữ liệu</label>
                <input name="recharge_date" className="aws-input" type="datetime-local"
                  defaultValue={st?.recharge_date ? st.recharge_date.slice(0, 16) : ''} />
              </div>
            </div>
          </div>

          {/* === FTP Servers === */}
          <div style={s.section}>
            <div style={s.sectionTitle}>FTP Servers ({ftpItems.length})</div>
            {ftpItems.map((item, index) => (
              <FtpCard
                key={item.id}
                id={item.id}
                index={index}
                initial={item.data}
                showRemove={ftpItems.length > 1}
                onRemove={() => removeFtp(item.id)}
              />
            ))}
            <button type="button" onClick={addFtp} style={s.addFtpBtn}>
              + Thêm FTP Server
            </button>
          </div>

        </form>

        {/* Footer */}
        <div style={s.footer}>
          <button onClick={onClose} style={s.btnCancel}>Huỷ</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ ...s.btnSave, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang lưu...' : st ? 'Cập nhật' : 'Tạo trạm'}
          </button>
        </div>

      </div>
    </div>
  );
}