// src/pages/LoginPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { loginUrl } = useAuth();

  return (
    <div className="login-page" style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="login-card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px 40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <span className="material-icons" style={{
          fontSize: 64,
          color: 'var(--primary-color)',
          marginBottom: 24,
        }}>
          lock_open
        </span>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: 16,
          color: 'var(--text-primary)',
        }}>
          登录博客
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          使用 GitHub 账号登录，登录后可以发表文章、评论互动
        </p>
        
        <a
          href={loginUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--primary-gradient)',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '16px',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          className="login-btn"
        >
          <span className="material-icons">github</span>
          使用 GitHub 登录
        </a>
        
        <div style={{
          marginTop: 32,
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
        }}>
          <p style={{
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            marginBottom: 8,
          }}>
            登录后可以：
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}>
            <li style={{ marginBottom: 4 }}>📝 发表和管理文章</li>
            <li style={{ marginBottom: 4 }}>💬 评论和互动</li>
            <li>📊 查看统计数据</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;