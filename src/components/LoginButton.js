// src/components/LoginButton.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoginButton() {
  const { isLoggedIn, user, logout, loginUrl, isOwner } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img 
          src={user?.avatarUrl || ''} 
          alt={user?.login || 'User'} 
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%',
            border: '2px solid var(--primary-color)'
          }}
        />
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {user?.login}
          {isOwner && <span style={{ color: 'var(--primary-color)', marginLeft: 4 }}>★</span>}
        </span>
        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          className="nav-link"
        >
          <span className="material-icons" style={{ fontSize: 20 }}>logout</span>
        </button>
      </div>
    );
  }

  return (
    <a
      href={loginUrl}
      className="nav-link"
      style={{
        background: 'var(--primary-gradient)',
        color: 'white',
        borderRadius: '8px',
        padding: '8px 16px',
        textDecoration: 'none',
        fontWeight: 600,
      }}
    >
      <span className="material-icons" style={{ fontSize: 18 }}>login</span>
      <span>登录</span>
    </a>
  );
}

export default LoginButton;