import React, { useState, useEffect, useCallback } from 'react';
import { stationGroupApi } from '../api/stationGroupApi';
import { auth } from '../api/authApi';
import StationGroupForm from './StationGroupForm';
import StationGroupDetail from './StationGroupDetail';
import ConfirmDialog from './ConfirmDialog';

const s = {
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20, gap: 12, flexWrap: 'wrap',
  },
  pageTitle: { fontSize: 20, fontWeight: 700, color: '#0d3b6e' },
  pageSub: { fontSize: 13, color: '#7a94a8', marginTop: 2 },

  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '1px solid #ccd8e8', borderRadius: 10,
    padding: '0 14px', height: 40, flex: '0 0 280px',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#12263a', flex: 1,
  },
  btnAdd: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '0 20px', height: 40, borderRadius: 10,
    background: '#0d3b6e', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    whiteSpace: 'nowrap', transition: '0.15s',
  },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 },
  statCard: {
    background: '#fff', border: '1px solid #ccd8e8', borderRadius: 12,
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  statNum: { fontSize: 26, fontWeight: 700, color: '#0d3b6e', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#7a94a8', marginTop: 3 },

  tableWrap: {
    background: '#fff', borderRadius: 14, border: '1px solid #ccd8e8',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(13,59,110,0.06)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '11px 16px', textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: '#7a94a8', letterSpacing: '0.06em',
    textTransform: 'uppercase', background: '#f5f8fc',
    borderBottom: '1px solid #ccd8e8',
  },
  td: {
    padding: '13px 16px', fontSize: 13, color: '#12263a',
    borderBottom: '1px solid #edf2f7', verticalAlign: 'middle',
  },
  codeBadge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
    background: '#e8f1fb', color: '#0d3b6e',
    fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
  },
  levelBadge: (lvl) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
    background: lvl === 0 ? '#fef4e3' : lvl === 1 ? '#e8f1fb' : '#eaf7f0',
    color: lvl === 0 ? '#a37411' : lvl === 1 ? '#0d3b6e' : '#1b7a4a',
    fontSize: 11, fontWeight: 700,
  }),
  actionBtn: (variant) => ({
    padding: '5px 12px', borderRadius: 7, border: 'none',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: variant === 'edit' ? '#e8f1fb' : variant === 'delete' ? '#fdecea' : '#f5f8fc',
    color: variant === 'edit' ? '#1a5fa8' : variant === 'delete' ? '#b5261e' : '#3d5a72',
  }),
  empty: { textAlign: 'center', padding: '60px 20px', color: '#a8bdd4' },
  loading: { textAlign: 'center', padding: '60px 20px', color: '#1a5fa8', fontSize: 15 },
  error: {
    background: '#fdecea', color: '#b5261e', borderRadius: 10,
    padding: '14px 20px', marginBottom: 20, fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 8,
  },
};

export default function StationGroupsPage({ toast, onAuthError }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await stationGroupApi.getAll({  page_size: 1000 });
      // API trả về { page, page_size, total, items: [...] }
      const list = Array.isArray(data) ? data : (data.items || data.data || []);
      setGroups(list);
    } catch (e) {
      if (e.message.includes('401')) {
        auth.removeToken?.();
        onAuthError?.();
        return;
      }
      setError('Không thể tải danh sách nhóm: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    try {
      if (editGroup) {
        // Khi update, không gửi Code (đã có trong URL)
        const { Code, ...updatePayload } = payload;
        await stationGroupApi.update(editGroup.Code, updatePayload);
        toast?.('Cập nhật nhóm thành công!');
      } else {
        await stationGroupApi.create(payload);
        toast?.('Thêm nhóm trạm thành công!');
      }
      setFormOpen(false);
      setEditGroup(null);
      load();
    } catch (e) {
      toast?.('Lỗi: ' + e.message, 'error');
      throw e; // để form biết mà không đóng
    }
  };

  // const handleDelete = async () => {
  //   try {
  //     await stationGroupApi.delete(deleteTarget.Code);
  //     toast?.('Đã xoá nhóm ' + deleteTarget.Code);
  //     setConfirmOpen(false);
  //     setDeleteTarget(null);
  //     load();
  //   } catch (e) {
  //     toast?.('Lỗi xoá: ' + e.message, 'error');
  //   }
  // };

  const filtered = groups.filter(g =>
    !search || [g.Code, g.Name, g.Description, g.ParentCode]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  // Đếm số nhóm theo cấp
  const rootCount = groups.filter(g => !g.ParentCode || g.Level === 0).length;
  const childCount = groups.length - rootCount;

  // Map Code -> Name để hiển thị tên ParentCode
  const codeToName = groups.reduce((acc, g) => {
    acc[g.Code] = g.Name;
    return acc;
  }, {});

  return (
    <div>
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { icon: '📁', num: groups.length, label: 'Tổng số nhóm', bg: '#e8f1fb' },
          { icon: '🌳', num: rootCount, label: 'Nhóm cấp gốc', bg: '#fef4e3' },
          { icon: '🔗', num: childCount, label: 'Nhóm con', bg: '#eaf7f0' },
        ].map((st, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ ...s.statIcon, background: st.bg }}>{st.icon}</div>
            <div>
              <div style={s.statNum}>{st.num}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div>
          <div style={s.pageTitle}>Danh sách nhóm trạm</div>
          <div style={s.pageSub}>Quản lý cấu trúc phân nhóm các trạm đo AWS</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={s.searchBox}>
            <span style={{ color: '#a8bdd4', fontSize: 15 }}>🔍</span>
            <input
              style={s.searchInput} placeholder="Tìm mã, tên, mô tả..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8bdd4', fontSize: 16 }}>
                ✕
              </button>
            )}
          </div>
          <button style={s.btnAdd}
            onMouseEnter={e => e.currentTarget.style.background = '#1a5fa8'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d3b6e'}
            onClick={() => { setEditGroup(null); setFormOpen(true); }}>
            + Thêm nhóm
          </button>
        </div>
      </div>

      {error && (
        <div style={s.error}>
          <span>⚠</span>{error}
          <button onClick={load} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: '#b5261e', cursor: 'pointer', fontWeight: 600,
          }}>Thử lại</button>
        </div>
      )}

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loading}>⏳ Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              {search ? 'Không tìm thấy nhóm phù hợp' : 'Chưa có nhóm nào'}
            </div>
            <div style={{ fontSize: 13 }}>
              {search ? 'Thử tìm với từ khoá khác' : 'Nhấn "+ Thêm nhóm" để bắt đầu'}
            </div>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['STT', 'Mã nhóm', 'Tên nhóm', 'Cấp', 'Nhóm cha', 'Mô tả', 'Cập nhật', 'Thao tác']
                  .map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <tr key={g.Code || i}
                  style={{ transition: '0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f8fc'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...s.td, color: '#a8bdd4', width: 50 }}>{i + 1}</td>
                  <td style={s.td}><span style={s.codeBadge}>{g.Code}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, maxWidth: 200 }}>{g.Name}</td>
                  <td style={s.td}>
                    <span style={s.levelBadge(g.Level ?? 0)}>Lvl {g.Level ?? 0}</span>
                  </td>
                  <td style={s.td}>
                    {g.ParentCode
                      ? <span style={s.codeBadge} title={codeToName[g.ParentCode] || ''}>{g.ParentCode}</span>
                      : <span style={{ color: '#a8bdd4', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ ...s.td, color: '#3d5a72', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.Description || '—'}
                  </td>
                  <td style={{ ...s.td, fontSize: 12, color: '#7a94a8' }}>
                    {g.UpdatedAt ? new Date(g.UpdatedAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={s.actionBtn('view')}
                        onClick={() => { setDetailGroup(g); setDetailOpen(true); }}>👁 Xem</button>
                      <button style={s.actionBtn('edit')}
                        onClick={() => { setEditGroup(g); setFormOpen(true); }}>✏️ Sửa</button>
                      {/* <button style={s.actionBtn('delete')}
                        onClick={() => { setDeleteTarget(g); setConfirmOpen(true); }}>🗑 Xoá</button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <StationGroupForm
        open={formOpen}
        group={editGroup}
        parentOptions={groups}
        onClose={() => { setFormOpen(false); setEditGroup(null); }}
        onSave={handleSave}
      />
      <StationGroupDetail
        open={detailOpen}
        group={detailGroup}
        onClose={() => setDetailOpen(false)}
        onEdit={() => { setDetailOpen(false); setEditGroup(detailGroup); setFormOpen(true); }}
      />
      {/* <ConfirmDialog
        open={confirmOpen}
        message={`Bạn có chắc muốn xoá nhóm "${deleteTarget?.Name}" (${deleteTarget?.Code})?`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      /> */}
    </div>
  );
}
