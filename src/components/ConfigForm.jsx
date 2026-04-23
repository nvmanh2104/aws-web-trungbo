import React, { useEffect, useRef, useState } from 'react';

const EMPTY_FTP = { ftp_host: '', ftp_port: 21, ftp_user: '', ftp_pass: '', ftp_directory: '' };

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,25,44,0.65)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 7000, overflowY: 'auto', padding: '24px 16px',
  },
  modal: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 760,
    boxShadow: '0 8px 48px rgba(0,0,0,0.25)', margin: 'auto',
  },
  header: {
    padding: '20px 28px 16px', borderBottom: '1px solid #ccd8e8',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  body: { padding: '24px 28px' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: 700, color: '#7a94a8', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8,
    borderBottom: '1px solid #eef2f7',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 16px' },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#3d5a72' },
  req: { color: '#b5261e' }, // dấu * màu đỏ
  ftpCard: {
    border: '1px solid #ccd8e8', borderRadius: 10, padding: 16,
    background: '#f5f8fc', marginBottom: 12, position: 'relative',
  },
  ftpTitle: { fontSize: 12, fontWeight: 700, color: '#0d3b6e', marginBottom: 12 },
  removeBtn: {
    position: 'absolute', top: 12, right: 12, background: '#fdecea',
    color: '#b5261e', border: 'none', borderRadius: 6,
    padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
  },
  addFtpBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 8, border: '1px dashed #a8bdd4', background: 'transparent',
    color: '#1a5fa8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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

if (!document.getElementById('cfg-form-style')) {
  const tag = document.createElement('style');
  tag.id = 'cfg-form-style';
  tag.textContent = `
    .cfg-input {
      padding: 9px 12px; border-radius: 8px; border: 1px solid #ccd8e8;
      font-size: 13px; color: #12263a; outline: none; background: #f5f8fc;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .cfg-input:focus { border-color: #1a5fa8; background: #fff; }
    .cfg-input:disabled { background: #e8edf2; color: #7a94a8; cursor: not-allowed; }
    .cfg-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  `;
  document.head.appendChild(tag);
}

// Nhãn label dùng chung: req=true thì hiện dấu *
const Label = ({ children, req }) => (
  <label style={s.label}>
    {children}{req && <span style={s.req}> *</span>}
  </label>
);

const FtpCard = React.memo(({ id, index, initial, onRemove, showRemove }) => (
  <div style={s.ftpCard}>
    <div style={s.ftpTitle}>FTP Server #{index + 1}</div>
    {showRemove && <button type="button" onClick={onRemove} style={s.removeBtn}>Xoá</button>}
    <div style={s.grid2}>
      <div style={s.field}>
        <Label req>Host</Label>
        <input name={`ftp_host_${id}`} className="cfg-input cfg-mono" defaultValue={initial.ftp_host} placeholder="192.168.1.1" />
      </div>
      <div style={s.field}>
        <Label req>Port</Label>
        <input name={`ftp_port_${id}`} className="cfg-input" type="number" defaultValue={initial.ftp_port || 21} />
      </div>
      <div style={s.field}>
        <Label req>Username</Label>
        <input name={`ftp_user_${id}`} className="cfg-input" defaultValue={initial.ftp_user} />
      </div>
      <div style={s.field}>
        <Label req>Password</Label>
        <input name={`ftp_pass_${id}`} className="cfg-input" type="password" defaultValue={initial.ftp_pass} />
      </div>
      <div style={{ ...s.field, gridColumn: '1 / -1' }}>
        <Label>Thư mục</Label>
        <input name={`ftp_dir_${id}`} className="cfg-input cfg-mono" defaultValue={initial.ftp_directory} placeholder="/data/aws" />
      </div>
    </div>
  </div>
));

export default function ConfigForm({ open, config, stations, onClose, onSave }) {
  const [ftpItems, setFtpItems] = useState([{ id: 1, data: { ...EMPTY_FTP } }]);
  const [loading, setLoading] = useState(false);
  const nextId = useRef(2);
  const formRef = useRef();

  useEffect(() => {
    if (!open) return;
    nextId.current = 1;
    const list = config?.ftp_list?.length
      ? config.ftp_list.map(d => ({ id: nextId.current++, data: d }))
      : [{ id: nextId.current++, data: { ...EMPTY_FTP } }];
    setFtpItems(list);
  }, [open, config]);

  if (!open) return null;

  const addFtp = () => setFtpItems(p => [...p, { id: nextId.current++, data: { ...EMPTY_FTP } }]);
  const removeFtp = (id) => setFtpItems(p => p.filter(f => f.id !== id));

  const handleSubmit = async () => {
    const fd = new FormData(formRef.current);
     // ✅ Nếu đang edit thì lấy từ config, không lấy từ form (vì input bị disabled)
  const StationID = isEdit ? c.StationID : fd.get('StationID')?.trim();
  
  if (!StationID) { alert('Vui lòng chọn hoặc nhập Mã trạm!'); return; }

    const ftp_list = ftpItems.map(({ id }) => ({
      ftp_host:      fd.get(`ftp_host_${id}`)         || '',
      ftp_port:      Number(fd.get(`ftp_port_${id}`)) || 21,
      ftp_user:      fd.get(`ftp_user_${id}`)         || '',
      ftp_pass:      fd.get(`ftp_pass_${id}`)         || '',
      ftp_directory: fd.get(`ftp_dir_${id}`)          || '',
    }));

    const simCharged   = fd.get('sim_charged');
    const simExpired   = fd.get('sim_expired');
    const rechargeDate = fd.get('recharge_date');

    const payload = {
      StationID,
      StationName: { VN: fd.get('name_vn') || '', EN: fd.get('name_en') || '' },
      Region:      { VN: fd.get('region_vn') || '', EN: fd.get('region_en') || '' },
      Project:     fd.get('Project') || '',
      Lat:         parseFloat(fd.get('Lat')) || 0,
      Lon:         parseFloat(fd.get('Lon')) || 0,
      Address: {
        VN: { Province: fd.get('prov_vn') || '', District: fd.get('dist_vn') || '', Ward: fd.get('ward_vn') || '' },
        EN: { Province: fd.get('prov_en') || '', District: fd.get('dist_en') || '', Ward: fd.get('ward_en') || '' },
      },
      StationGroupCode: fd.get('StationGroupCode') || '',
      DefaultType:      fd.get('DefaultType') || '',
      SimCard: {
        PhoneNumber: fd.get('sim_phone') || '',                              // ✅ '' thay vì null
        ChargedAt:   simCharged   ? new Date(simCharged).toISOString()  : '', // ✅ '' thay vì null
        ExpiredAt:   simExpired   ? new Date(simExpired).toISOString()  : '', // ✅ '' thay vì null
      },
      phone_number:  fd.get('phone_number')  || '',
      recharge_date: rechargeDate ? new Date(rechargeDate).toISOString() : '', // ✅ fix null -> ''
      ftp_list,
    };

    setLoading(true);
    await onSave(payload);
    setLoading(false);
  };

  const c = config;
  const isEdit = !!c;

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0d3b6e' }}>
            {isEdit ? '✏️ Cập nhật cấu hình trạm' : '➕ Thêm cấu hình trạm'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7a94a8' }}>✕</button>
        </div>

        <form ref={formRef} onSubmit={e => e.preventDefault()} style={s.body}>

          {/* Thông tin cơ bản */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Thông tin trạm</div>
            <div style={s.grid2}>
              <div style={s.field}>
                <Label req>Mã trạm</Label>
                {isEdit ? (
                  <input name="StationID" className="cfg-input" defaultValue={c.StationID} disabled />
                ) : (
                  <select name="StationID" className="cfg-input">
                    <option value="">-- Chọn trạm --</option>
                    {stations.map(st => (
                      <option key={st.StationID} value={st.StationID}>
                        {st.StationID} — {st.StationName?.VN || st.StationName?.EN}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div style={s.field}>
                <Label>Dự án</Label>
                <input name="Project" className="cfg-input" defaultValue={c?.Project || ''} />
              </div>
              <div style={s.field}>
                <Label>Tên trạm (VN)</Label>
                <input name="name_vn" className="cfg-input" defaultValue={c?.StationName?.VN || ''} />
              </div>
              <div style={s.field}>
                <Label>Tên trạm (EN)</Label>
                <input name="name_en" className="cfg-input" defaultValue={c?.StationName?.EN || ''} />
              </div>
              <div style={s.field}>
                <Label>Khu vực (VN)</Label>
                <input name="region_vn" className="cfg-input" defaultValue={c?.Region?.VN || ''} />
              </div>
              <div style={s.field}>
                <Label>Khu vực (EN)</Label>
                <input name="region_en" className="cfg-input" defaultValue={c?.Region?.EN || ''} />
              </div>
              <div style={s.field}>
                <Label>Nhóm trạm</Label>
                <input name="StationGroupCode" className="cfg-input" defaultValue={c?.StationGroupCode || ''} />
              </div>
              <div style={s.field}>
                <Label>Loại mặc định</Label>
                <input name="DefaultType" className="cfg-input" defaultValue={c?.DefaultType || ''} />
              </div>
              <div style={s.field}>
                <Label>Vĩ độ (Lat)</Label>
                <input name="Lat" className="cfg-input cfg-mono" type="number" step="any" defaultValue={c?.Lat ?? ''} />
              </div>
              <div style={s.field}>
                <Label>Kinh độ (Lon)</Label>
                <input name="Lon" className="cfg-input cfg-mono" type="number" step="any" defaultValue={c?.Lon ?? ''} />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Địa chỉ</div>
            <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#7a94a8' }}>🇻🇳 Tiếng Việt</div>
            <div style={{ ...s.grid3, marginBottom: 12 }}>
              {[['prov_vn','Tỉnh/TP','VN','Province'],['dist_vn','Huyện/Quận','VN','District'],['ward_vn','Xã/Phường','VN','Ward']].map(([name, label, lang, key]) => (
                <div key={name} style={s.field}>
                  <Label>{label}</Label>
                  <input name={name} className="cfg-input" defaultValue={c?.Address?.[lang]?.[key] || ''} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#7a94a8' }}>🇬🇧 English</div>
            <div style={s.grid3}>
              {[['prov_en','Province','EN','Province'],['dist_en','District','EN','District'],['ward_en','Ward','EN','Ward']].map(([name, label, lang, key]) => (
                <div key={name} style={s.field}>
                  <Label>{label}</Label>
                  <input name={name} className="cfg-input" defaultValue={c?.Address?.[lang]?.[key] || ''} />
                </div>
              ))}
            </div>
          </div>

          {/* SIM */}
          <div style={s.section}>
            <div style={s.sectionTitle}>SIM Card</div>
            <div style={s.grid3}>
              <div style={s.field}>
                <Label req>Số điện thoại SIM</Label>
                <input name="sim_phone" className="cfg-input" defaultValue={c?.SimCard?.PhoneNumber || ''} placeholder="09xxxxxxxx" />
              </div>
              <div style={s.field}>
                <Label req>Ngày nạp tiền</Label>
                <input name="sim_charged" className="cfg-input" type="datetime-local"
                  defaultValue={c?.SimCard?.ChargedAt ? c.SimCard.ChargedAt.slice(0,16) : ''} />
              </div>
              <div style={s.field}>
                <Label req>Hết hạn</Label>
                <input name="sim_expired" className="cfg-input" type="datetime-local"
                  defaultValue={c?.SimCard?.ExpiredAt ? c.SimCard.ExpiredAt.slice(0,16) : ''} />
              </div>
            </div>
          </div>

          {/* Liên hệ */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Liên hệ & Dữ liệu</div>
            <div style={s.grid2}>
              <div style={s.field}>
                <Label>Số điện thoại liên hệ</Label>
                <input name="phone_number" className="cfg-input" defaultValue={c?.phone_number || ''} />
              </div>
              <div style={s.field}>
                <Label req>Ngày nạp dữ liệu</Label>
                <input name="recharge_date" className="cfg-input" type="datetime-local"
                  defaultValue={c?.recharge_date ? c.recharge_date.slice(0,16) : ''} />
              </div>
            </div>
          </div>

          {/* FTP */}
          <div style={s.section}>
            <div style={s.sectionTitle}>FTP Servers ({ftpItems.length})</div>
            {ftpItems.map((item, index) => (
              <FtpCard key={item.id} id={item.id} index={index} initial={item.data}
                showRemove={ftpItems.length > 1} onRemove={() => removeFtp(item.id)} />
            ))}
            <button type="button" onClick={addFtp} style={s.addFtpBtn}>+ Thêm FTP Server</button>
          </div>

        </form>

        <div style={s.footer}>
          <button onClick={onClose} style={s.btnCancel}>Huỷ</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ ...s.btnSave, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
}