import React, { useState, useEffect, useCallback } from 'react';
import { stationApi } from './api/stationApi';
import { auth } from './api/authApi';
import LoginPage from './components/LoginPage';
import StationDetail from './components/StationDetail';
import Toast from './components/Toast';
import StationGroupsPage from './components/StationGroupsPage';
import ConfigPage from './components/ConfigPage';

const s = {
  app: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4f8' },
  header: {
    background: 'linear-gradient(135deg, #0d3b6e 0%, #1a5fa8 100%)',
    padding: '0 32px', height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 2px 12px rgba(13,59,110,0.3)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
  },
  logoText: { color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 },
  logoSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
  tabsBar: {
    background: '#fff', borderBottom: '1px solid #ccd8e8',
    padding: '0 32px', display: 'flex', gap: 4,
    position: 'sticky', top: 64, zIndex: 99,
  },
  tab: (active) => ({
    padding: '14px 20px', fontSize: 13, fontWeight: 600,
    color: active ? '#0d3b6e' : '#7a94a8',
    background: 'transparent', border: 'none',
    borderBottom: active ? '3px solid #0d3b6e' : '3px solid transparent',
    cursor: 'pointer', transition: '0.15s',
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
  }),
  main: { flex: 1, padding: '28px 32px', maxWidth: 1300, margin: '0 auto', width: '100%' },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20, gap: 12, flexWrap: 'wrap',
  },
  pageTitle: { fontSize: 20, fontWeight: 700, color: '#0d3b6e' },
  pageSub: { fontSize: 13, color: '#7a94a8', marginTop: 2 },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '1px solid #ccd8e8', borderRadius: 10,
    padding: '0 14px', height: 40, flex: '0 0 320px',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#12263a', flex: 1,
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 },
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
    borderBottom: '1px solid #ccd8e8', whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 16px', fontSize: 13, color: '#12263a',
    borderBottom: '1px solid #edf2f7', verticalAlign: 'middle',
  },
  codeBadge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
    background: '#e8f1fb', color: '#0d3b6e',
    fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
  },
  groupBadge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    background: '#f0f4f8', color: '#3d5a72',
    fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
  },
  simOk: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: '#eaf7f0', color: '#1b7a4a',
  },
  simExpired: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: '#fdecea', color: '#b5261e',
  },
  simNone: { color: '#a8bdd4', fontSize: 12 },
  actionBtn: {
    padding: '5px 14px', borderRadius: 7, border: 'none',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: '#e8f1fb', color: '#1a5fa8',
  },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#a8bdd4' },
  loading: { textAlign: 'center', padding: '60px 20px', color: '#1a5fa8', fontSize: 15 },
  error: {
    background: '#fdecea', color: '#b5261e', borderRadius: 10,
    padding: '14px 20px', marginBottom: 20, fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
    padding: '14px 20px', borderTop: '1px solid #edf2f7',
    fontSize: 13, color: '#7a94a8',
  },
  pageBtn: (active) => ({
    padding: '4px 10px', borderRadius: 6, border: '1px solid',
    borderColor: active ? '#0d3b6e' : '#ccd8e8',
    background: active ? '#0d3b6e' : '#fff',
    color: active ? '#fff' : '#3d5a72',
    fontWeight: 600, fontSize: 12, cursor: 'pointer',
  }),
};

function getAddressShort(st) {
  const a = st.Address?.VN || st.Address?.EN;
  if (!a) return '—';
  const parts = [a.Ward, a.District, a.Province].filter(Boolean);
  // Bỏ trùng (nhiều trạm Ward=District=Province)
  const unique = [...new Set(parts)];
  return unique.join(', ') || '—';
}

function isSimExpired(st) {
  const exp = st.SimCard?.ExpiredAt;
  return exp ? new Date(exp) < new Date() : false;
}

function SimCell({ station }) {
  const phone = station.SimCard?.PhoneNumber;
  if (!phone) return <span style={s.simNone}>Chưa có</span>;
  const expired = isSimExpired(station);
  return (
    <span style={expired ? s.simExpired : s.simOk}>
      {expired ? '⚠️' : '📱'} {phone}
    </span>
  );
}

const PAGE_SIZE = 20;

export default function App() {
  const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn());
  const [activeTab, setActiveTab] = useState('stations'); // 'stations' | 'config' | 'groups'

  const [allStations, setAllStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStation, setDetailStation] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // Tải toàn bộ (page_size lớn) để filter/phân trang ở client
      const data = await stationApi.getAll(50);
      const list = data?.items || (Array.isArray(data) ? data : []);
      setAllStations(list);
      setPage(1);
    } catch (e) {
      if (e.message?.includes('401')) { auth.removeToken(); setLoggedIn(false); return; }
      setError('Không thể tải dữ liệu: ' + e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (loggedIn && activeTab === 'stations') load();
  }, [loggedIn, activeTab, load]);

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  // ── Filter & phân trang ───────────────────────────────────────────────────
  const filtered = allStations.filter(st => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [
      st.StationID,
      st.StationName?.VN,
      st.StationName?.EN,
      st.Region?.VN,
      st.Address?.VN?.Province,
      st.Address?.VN?.District,
      st.Address?.VN?.Ward,
      st.SimCard?.PhoneNumber,
      st.Project,
      st.StationGroupCode,
    ].some(v => v?.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const simCount = allStations.filter(s => s.SimCard?.PhoneNumber).length;
  const simExpiredCount = allStations.filter(isSimExpired).length;
  const projects = [...new Set(allStations.map(s => s.Project).filter(Boolean))].length;

  return (
    <div style={s.app}>
      <Toast toasts={toasts} remove={removeToast} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🌦️</div>
          <div>
            <div style={s.logoText}>Trạm AWS Trung Bộ</div>
            <div style={s.logoSub}>Hệ thống quản lý cấu hình</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => activeTab === 'stations' ? load() : null}
            title="Tải lại" style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 14,
            }}>↺</button>
          <button onClick={auth.logout} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}>🚪 Đăng xuất</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={s.tabsBar}>
        <button style={s.tab(activeTab === 'stations')} onClick={() => setActiveTab('stations')}>
          📡 Trạm AWS
        </button>
        <button style={s.tab(activeTab === 'config')} onClick={() => setActiveTab('config')}>
          ⚙️ Cấu hình trạm
        </button>
        <button style={s.tab(activeTab === 'groups')} onClick={() => setActiveTab('groups')}>
          📁 Nhóm trạm
        </button>
      </div>

      <main style={s.main}>
        {activeTab === 'stations' ? (
          <>
            {/* Stats */}
            <div style={s.statsRow}>
              {[
                { icon: '📡', num: allStations.length, label: 'Tổng số trạm',   bg: '#e8f1fb' },
                { icon: '🗂️', num: projects,            label: 'Dự án',          bg: '#f0f4ff' },
                { icon: '📱', num: simCount,            label: 'Có SIM',         bg: '#eaf7f0' },
                { icon: '⚠️', num: simExpiredCount,    label: 'SIM hết hạn',    bg: '#fdecea' },
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
                <div style={s.pageTitle}>Danh sách trạm</div>
                <div style={s.pageSub}>
                  {filtered.length} / {allStations.length} trạm
                  {search ? ` — kết quả tìm kiếm "${search}"` : ''}
                </div>
              </div>
              <div style={s.searchBox}>
                <span style={{ color: '#a8bdd4', fontSize: 15 }}>🔍</span>
                <input
                  style={s.searchInput}
                  placeholder="Tìm mã, tên, tỉnh, huyện, SIM, dự án..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setPage(1); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8bdd4', fontSize: 16 }}>✕</button>
                )}
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
                    {search ? 'Không tìm thấy trạm phù hợp' : 'Chưa có dữ liệu'}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {search ? 'Thử từ khoá khác' : 'Nhấn ↺ để tải lại'}
                  </div>
                </div>
              ) : (
                <>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {['STT', 'Mã trạm', 'Tên trạm', 'Khu vực', 'Địa chỉ', 'Dự án', 'Nhóm', 'SIM Card', 'Tọa độ', ''].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((st, i) => (
                        <tr key={st.StationID}
                          style={{ transition: '0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f8fc'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ ...s.td, color: '#a8bdd4', width: 44 }}>
                            {(currentPage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td style={s.td}>
                            <span style={s.codeBadge}>{st.StationID}</span>
                          </td>
                          <td style={{ ...s.td, fontWeight: 600, minWidth: 130 }}>
                            {st.StationName?.VN || '—'}
                            {st.StationName?.EN && st.StationName.EN !== st.StationName?.VN && (
                              <div style={{ fontSize: 11, color: '#7a94a8', fontWeight: 400 }}>
                                {st.StationName.EN}
                              </div>
                            )}
                          </td>
                          <td style={{ ...s.td, color: '#3d5a72' }}>{st.Region?.VN || '—'}</td>
                          <td style={{ ...s.td, color: '#3d5a72', maxWidth: 200, fontSize: 12 }}>
                            {getAddressShort(st)}
                          </td>
                          <td style={{ ...s.td, fontSize: 12 }}>{st.Project || '—'}</td>
                          <td style={s.td}>
                            <span style={s.groupBadge}>{st.StationGroupCode || '—'}</span>
                          </td>
                          <td style={s.td}><SimCell station={st} /></td>
                          <td style={{ ...s.td, fontSize: 11, fontFamily: 'monospace', color: '#7a94a8', whiteSpace: 'nowrap' }}>
                            {st.Lat != null ? `${st.Lat.toFixed(4)}, ${st.Lon.toFixed(4)}` : '—'}
                          </td>
                          <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                            <button style={s.actionBtn}
                              onClick={() => { setDetailStation(st); setDetailOpen(true); }}>
                              👁 Xem
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={s.pagination}>
                      <span>Trang {currentPage}/{totalPages} ({filtered.length} trạm)</span>
                      <button style={s.pageBtn(false)} disabled={currentPage === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Trước</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span>…</span>}
                            <button style={s.pageBtn(p === currentPage)} onClick={() => setPage(p)}>{p}</button>
                          </React.Fragment>
                        ))}
                      <button style={s.pageBtn(false)} disabled={currentPage === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sau ›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : activeTab === 'config' ? (
          <ConfigPage toast={toast} onAuthError={() => setLoggedIn(false)} />
        ) : (
          <StationGroupsPage toast={toast} onAuthError={() => setLoggedIn(false)} />
        )}
      </main>

      <StationDetail
        open={detailOpen} station={detailStation}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
