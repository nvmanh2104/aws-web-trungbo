import React, { useState, useEffect, useCallback } from 'react';
import { configApi } from '../api/configApi';
import { stationApi } from '../api/stationApi';
import ConfigForm from './ConfigForm';
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
    padding: '0 14px', height: 40, flex: '0 0 300px',
  },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1 },
  btnAdd: {
    display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px', height: 40,
    borderRadius: 10, background: '#0d3b6e', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 },
  statCard: {
    background: '#fff', border: '1px solid #ccd8e8', borderRadius: 12,
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  statNum: { fontSize: 26, fontWeight: 700, color: '#0d3b6e', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#7a94a8', marginTop: 3 },
  tableWrap: {
    background: '#fff', borderRadius: 14, border: '1px solid #ccd8e8',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(13,59,110,0.06)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: '#7a94a8', letterSpacing: '0.06em', textTransform: 'uppercase',
    background: '#f5f8fc', borderBottom: '1px solid #ccd8e8', whiteSpace: 'nowrap',
  },
  td: { padding: '12px 16px', fontSize: 13, color: '#12263a', borderBottom: '1px solid #edf2f7', verticalAlign: 'middle' },
  codeBadge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
    background: '#e8f1fb', color: '#0d3b6e', fontSize: 12, fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
  },
  ftpBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
    borderRadius: 6, background: '#eaf7f0', color: '#1b7a4a', fontSize: 11, fontWeight: 600,
  },
  simOk: { color: '#1b7a4a', fontSize: 12, fontWeight: 600 },
  simExp: { color: '#b5261e', fontSize: 12, fontWeight: 600 },
  actionBtn: (v) => ({
    padding: '5px 12px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: v === 'edit' ? '#e8f1fb' : v === 'delete' ? '#fdecea' : '#f5f8fc',
    color: v === 'edit' ? '#1a5fa8' : v === 'delete' ? '#b5261e' : '#3d5a72',
  }),
  empty: { textAlign: 'center', padding: '60px 20px', color: '#a8bdd4' },
  loading: { textAlign: 'center', padding: '60px 20px', color: '#1a5fa8', fontSize: 15 },
  error: {
    background: '#fdecea', color: '#b5261e', borderRadius: 10,
    padding: '14px 20px', marginBottom: 20, fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
    padding: '14px 20px', borderTop: '1px solid #edf2f7', fontSize: 13, color: '#7a94a8',
  },
};

function isSimExpired(cfg) {
  const exp = cfg?.SimCard?.ExpiredAt;
  return exp ? new Date(exp) < new Date() : false;
}

export default function ConfigPage({ toast, onAuthError }) {
  const [configs, setConfigs] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const [formOpen, setFormOpen] = useState(false);
  const [editConfig, setEditConfig] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [cfgData, stData] = await Promise.all([
        configApi.getAll(10),
        stationApi.getAll(10),
      ]);
      setConfigs(cfgData?.items || []);
      setStations(stData?.items || []);
    } catch (e) {
      if (e.message?.includes('401')) { onAuthError(); return; }
      setError('Lỗi tải dữ liệu: ' + e.message);
    } finally { setLoading(false); }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    try {
      if (editConfig) {
        await configApi.update(editConfig.StationID, payload);
        toast('Cập nhật cấu hình thành công!');
      } else {
        await configApi.create(payload);
        toast('Thêm cấu hình thành công!');
      }
      setFormOpen(false); setEditConfig(null);
      load();
    } catch (e) { toast('Lỗi: ' + e.message, 'error'); }
  };

  const handleDelete = async () => {
    try {
      await configApi.delete(deleteTarget.StationID);
      toast(`Đã xoá cấu hình trạm ${deleteTarget.StationID}`);
      setConfirmOpen(false); setDeleteTarget(null);
      load();
    } catch (e) {
      // ✅ Hiện message từ server thay vì "Lỗi xoá: ..."
      toast(e.message, 'error');
      setConfirmOpen(false);
    }
  };

  const filtered = configs.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [c.StationID, c.StationName?.VN, c.StationName?.EN,
      c.Project, c.Region?.VN, c.SimCard?.PhoneNumber, c.phone_number]
      .some(v => v?.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages);
  const paginated = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const totalFtp = configs.reduce((s, c) => s + (c.ftp_list?.length || 0), 0);
  const simExpCount = configs.filter(isSimExpired).length;

  return (
    <div>
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { icon: '⚙️', num: configs.length, label: 'Tổng cấu hình', bg: '#e8f1fb' },
          { icon: '🖥️', num: totalFtp,        label: 'FTP Servers',   bg: '#eaf7f0' },
          { icon: '⚠️', num: simExpCount,     label: 'SIM hết hạn',  bg: '#fdecea' },
        ].map((st, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ ...s.statIcon, background: st.bg }}>{st.icon}</div>
            <div><div style={s.statNum}>{st.num}</div><div style={s.statLabel}>{st.label}</div></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div>
          <div style={s.pageTitle}>Cấu hình trạm AWS</div>
          <div style={s.pageSub}>{filtered.length} / {configs.length} bản ghi</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={s.searchBox}>
            <span style={{ color: '#a8bdd4' }}>🔍</span>
            <input style={s.searchInput} placeholder="Tìm mã, tên, dự án, SIM..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            {search && <button onClick={() => { setSearch(''); setPage(1); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8bdd4', fontSize: 16 }}>✕</button>}
          </div>
          <button style={s.btnAdd}
            onMouseEnter={e => e.currentTarget.style.background = '#1a5fa8'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d3b6e'}
            onClick={() => { setEditConfig(null); setFormOpen(true); }}>
            + Thêm cấu hình
          </button>
        </div>
      </div>

      {error && (
        <div style={s.error}>
          <span>⚠</span>{error}
          <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#b5261e', cursor: 'pointer', fontWeight: 600 }}>Thử lại</button>
        </div>
      )}

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loading}>⏳ Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{search ? 'Không tìm thấy' : 'Chưa có cấu hình nào'}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{search ? 'Thử từ khoá khác' : 'Nhấn "+ Thêm cấu hình" để bắt đầu'}</div>
          </div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  {['STT','Mã trạm','Tên trạm','Dự án','Khu vực','SIM Card','FTP','SĐT liên hệ','Ngày nạp DL','Cập nhật','Thao tác'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => {
                  const expired = isSimExpired(c);
                  const updAt = c.updated_at ? new Date(c.updated_at).toLocaleDateString('vi-VN') : '—';
                  return (
                    <tr key={c.StationID || i}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f8fc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ ...s.td, color: '#a8bdd4', width: 44 }}>{(cur-1)*PAGE_SIZE+i+1}</td>
                      <td style={s.td}><span style={s.codeBadge}>{c.StationID}</span></td>
                      <td style={{ ...s.td, fontWeight: 600, minWidth: 120 }}>{c.StationName?.VN || '—'}</td>
                      <td style={{ ...s.td, fontSize: 12 }}>{c.Project || '—'}</td>
                      <td style={{ ...s.td, fontSize: 12 }}>{c.Region?.VN || '—'}</td>
                      <td style={s.td}>
                        {c.SimCard?.PhoneNumber
                          ? <span style={expired ? s.simExp : s.simOk}>{expired ? '⚠️ ' : '📱 '}{c.SimCard.PhoneNumber}</span>
                          : <span style={{ color: '#a8bdd4', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={s.td}>
                        {c.ftp_list?.length > 0
                          ? <span style={s.ftpBadge}>⚡ {c.ftp_list.length}</span>
                          : <span style={{ color: '#a8bdd4', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ ...s.td, fontSize: 12 }}>{c.phone_number || '—'}</td>
                      <td style={{ ...s.td, fontSize: 12 }}>{c.recharge_date ? c.recharge_date.slice(0,10) : '—'}</td>
                      <td style={{ ...s.td, fontSize: 12, color: '#7a94a8' }}>{updAt}</td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={s.actionBtn('edit')}
                            onClick={() => { setEditConfig(c); setFormOpen(true); }}>✏️ Sửa</button>
                          <button style={s.actionBtn('delete')}
                            onClick={() => { setDeleteTarget(c); setConfirmOpen(true); }}>🗑 Xoá</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={s.pagination}>
                <span>Trang {cur}/{totalPages}</span>
                <button style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ccd8e8', background: '#fff', cursor: 'pointer', fontSize: 12 }}
                  disabled={cur === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - cur) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx-1] !== p-1 && <span>…</span>}
                      <button onClick={() => setPage(p)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12,
                          borderColor: p === cur ? '#0d3b6e' : '#ccd8e8',
                          background: p === cur ? '#0d3b6e' : '#fff',
                          color: p === cur ? '#fff' : '#3d5a72', fontWeight: 600 }}>
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ccd8e8', background: '#fff', cursor: 'pointer', fontSize: 12 }}
                  disabled={cur === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfigForm
        open={formOpen} config={editConfig} stations={stations}
        onClose={() => { setFormOpen(false); setEditConfig(null); }}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={confirmOpen}
        message={`Xoá cấu hình trạm "${deleteTarget?.StationName?.VN}" (${deleteTarget?.StationID})?`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />
    </div>
  );
}