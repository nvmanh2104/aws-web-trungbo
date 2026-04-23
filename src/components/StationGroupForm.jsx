import React, { useEffect, useRef, useState } from 'react';
import { stationGroupApi } from '../api/stationGroupApi';

/* ── Styles (đồng bộ với StationForm) ── */
const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,25,44,0.6)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 7000, overflowY: 'auto', padding: '24px 16px',
  },
  modal: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
    boxShadow: '0 8px 48px rgba(0,0,0,0.22)', margin: 'auto',
  },
  header: {
    padding: '20px 28px 16px', borderBottom: '1px solid #ccd8e8',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  body: { padding: '24px 28px' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: 700, color: '#7a94a8', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 14,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#3d5a72' },
  hint: { fontSize: 11, color: '#7a94a8', marginTop: 2 },
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

export default function StationGroupForm({ open, group, parentOptions = [], onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    if (!open) return;
    // reset form khi mở
    if (formRef.current) formRef.current.reset();
  }, [open, group]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);

    const Code = fd.get('Code')?.trim();
    const Name = fd.get('Name')?.trim();

    if (!Code || !Name) {
      alert('Vui lòng nhập Mã và Tên nhóm!');
      return;
    }

    const payload = {
      Code,
      Name,
      Description: fd.get('Description')?.trim() || '',
      ParentCode: fd.get('ParentCode')?.trim() || '',
      Level: Number(fd.get('Level')) || 0,
    };

    setLoading(true);
    try {
      await onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0d3b6e' }}>
            {group ? '✏️ Chỉnh sửa nhóm trạm' : '➕ Thêm nhóm trạm mới'}
          </span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7a94a8' }}>
            ✕
          </button>
        </div>

        <form ref={formRef} onSubmit={e => e.preventDefault()} style={s.body}>
          <div style={s.section}>
            <div style={s.sectionTitle}>Thông tin nhóm</div>

            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>
                  Mã nhóm <span style={{ color: '#b5261e' }}>*</span>
                </label>
                <input
                  name="Code"
                  className="aws-input aws-input-mono"
                  defaultValue={group?.Code || ''}
                  disabled={!!group}
                  placeholder="VD: TN_KHV"
                  style={group ? { background: '#e8edf2', color: '#7a94a8' } : {}}
                />
                {group && <div style={s.hint}>Không thể thay đổi mã khi chỉnh sửa</div>}
              </div>

              <div style={s.field}>
                <label style={s.label}>
                  Tên nhóm <span style={{ color: '#b5261e' }}>*</span>
                </label>
                <input
                  name="Name"
                  className="aws-input"
                  defaultValue={group?.Name || ''}
                  placeholder="VD: Nhóm Khí hậu"
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Cấp độ (Level)</label>
                <input
                  name="Level"
                  className="aws-input"
                  type="number"
                  min="0"
                  defaultValue={group?.Level ?? 0}
                  placeholder="0"
                />
                <div style={s.hint}>0 = cấp gốc, 1 = cấp con, ...</div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Nhóm cha (ParentCode)</label>
                <select
                  name="ParentCode"
                  className="aws-input"
                  defaultValue={group?.ParentCode || ''}
                >
                  <option value="">— Không có (cấp gốc) —</option>
                  {parentOptions
                    .filter(g => !group || g.Code !== group.Code) // không chọn chính mình làm cha
                    .map(g => (
                      <option key={g.Code} value={g.Code}>
                        {g.Code} — {g.Name}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                <label style={s.label}>Mô tả</label>
                <textarea
                  name="Description"
                  className="aws-input"
                  defaultValue={group?.Description || ''}
                  rows={3}
                  placeholder="Mô tả chi tiết về nhóm trạm..."
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        </form>

        <div style={s.footer}>
          <button onClick={onClose} style={s.btnCancel}>Huỷ</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ ...s.btnSave, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang lưu...' : group ? 'Cập nhật' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
}
