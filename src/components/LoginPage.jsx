import React, { useRef, useState } from 'react';
import { auth } from '../api/authApi';

if (!document.getElementById('login-style')) {
  const tag = document.createElement('style');
  tag.id = 'login-style';
  tag.textContent = `
    .login-input {
      padding: 11px 14px; border-radius: 10px; border: 1.5px solid #ccd8e8;
      font-size: 14px; color: #12263a; outline: none; background: #f5f8fc;
      transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%; box-sizing: border-box;
    }
    .login-input:focus {
      border-color: #1a5fa8;
      box-shadow: 0 0 0 3px rgba(26,95,168,0.12);
      background: #fff;
    }
    .login-btn {
      width: 100%; padding: 12px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #0d3b6e 0%, #1a5fa8 100%);
      color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .login-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `;
  document.head.appendChild(tag);
}

export default function LoginPage({ onLogin }) {
  const userRef = useRef();
  const passRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user_name = userRef.current.value.trim();
    const user_pass = passRef.current.value;
    if (!user_name || !user_pass) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await auth.login(user_name, user_pass);
      onLogin();
    } catch (e) {
      setError(e.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1a2e 0%, #0d3b6e 50%, #1a5fa8 100%)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}>🌦️</div>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Trạm AWS Trung Bộ</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          Hệ thống quản lý cấu hình
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 20, padding: '36px 40px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0d3b6e' }}>Đăng nhập</div>
          <div style={{ fontSize: 13, color: '#7a94a8', marginTop: 4 }}>
            Nhập thông tin tài khoản để tiếp tục
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fdecea', color: '#b5261e', borderRadius: 10,
              padding: '10px 14px', marginBottom: 18, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3d5a72', display: 'block', marginBottom: 6 }}>
              Tên đăng nhập
            </label>
            <input
              ref={userRef}
              className="login-input"
              type="text"
              placeholder="Nhập tên đăng nhập..."
              autoFocus
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3d5a72', display: 'block', marginBottom: 6 }}>
              Mật khẩu
            </label>
            <input
              ref={passRef}
              className="login-input"
              type="password"
              placeholder="Nhập mật khẩu..."
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
          </button>
        </form>
      </div>

      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24 }}>
        © 2026 Trạm AWS Trung Bộ
      </div>
    </div>
  );
}