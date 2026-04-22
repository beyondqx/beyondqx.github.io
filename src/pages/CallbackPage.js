// src/pages/CallbackPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

function CallbackPage() {
  const navigate = useNavigate();
  const { updateAuth } = useAuth();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (!code) {
        setStatus('error');
        setError('未收到授权码');
        return;
      }

      try {
        const { token, user, isOwner } = await login(code);
        updateAuth(token, user, isOwner);
        setStatus('success');
        
        // 清除 URL 参数并跳转
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } catch (e) {
        setStatus('error');
        setError(e.message);
      }
    }
    
    handleCallback();
  }, [navigate, updateAuth]);

  if (status === 'loading') {
    return (
      <div className="callback-page" style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner" />
        <p style={{ marginTop: 16 }}>正在登录...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="callback-page" style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 48, color: 'red' }}>
            error
          </span>
          <p style={{ marginTop: 16, color: 'red' }}>{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="admin-btn"
            style={{ marginTop: 16 }}
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-page" style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-icons" style={{ fontSize: 48, color: 'green' }}>
          check_circle
        </span>
        <p style={{ marginTop: 16 }}>登录成功！正在跳转...</p>
      </div>
    </div>
  );
}

export default CallbackPage;