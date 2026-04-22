// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthState, logout as authLogout, getAuthUrl } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化检查登录状态
  useEffect(() => {
    async function initAuth() {
      try {
        const state = await getAuthState();
        setUser(state.user);
        setToken(state.token);
        setIsLoggedIn(state.isLoggedIn);
        setIsOwner(state.isOwner);
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // 登出
  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setIsOwner(false);
  }, []);

  // 更新登录状态 (OAuth 回调后调用)
  const updateAuth = useCallback((newToken, newUser, newIsOwner) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    setIsOwner(newIsOwner);
  }, []);

  // 获取登录 URL
  const loginUrl = getAuthUrl();

  const value = {
    user,
    token,
    isLoggedIn,
    isOwner,
    loading,
    logout,
    updateAuth,
    loginUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;