// src/services/auth.js
import { GITHUB_CONFIG } from '../config';
import { getUserInfo, checkCollaborator } from './githubApi';

const TOKEN_KEY = 'github_token';
const USER_KEY = 'github_user';

// 获取 OAuth 授权 URL
export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.CLIENT_ID,
    redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
    scope: GITHUB_CONFIG.SCOPES,
    response_type: 'code',
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// 用 code 交换 token (纯前端方式)
export async function exchangeCodeForToken(code) {
  // 注意：纯前端交换需要 CORS 代理或使用 GitHub 官方 OAuth App
  // 这里使用一个简化的方式，实际部署可能需要一个后端或使用 GitHub App
  const endpoint = 'https://github.com/login/oauth/access_token';
  
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.CLIENT_ID,
    code,
    redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  
  return data.access_token;
}

// 存储 token
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// 获取 token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 删除 token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// 存储用户信息
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// 获取用户信息
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

// 登录流程
export async function login(code) {
  const token = await exchangeCodeForToken(code);
  saveToken(token);
  
  const user = await getUserInfo(token);
  saveUser(user);
  
  const isOwner = await checkCollaborator(token);
  
  return { token, user, isOwner };
}

// 登出
export function logout() {
  removeToken();
}

// 检查登录状态
export function isLoggedIn() {
  return !!getToken();
}

// 获取完整登录信息
export async function getAuthState() {
  const token = getToken();
  if (!token) return { isLoggedIn: false, user: null, token: null, isOwner: false };
  
  let user = getUser();
  let isOwner = false;
  
  try {
    if (!user) {
      user = await getUserInfo(token);
      saveUser(user);
    }
    isOwner = user.login === GITHUB_CONFIG.OWNER;
  } catch (e) {
    // Token 可能失效
    logout();
    return { isLoggedIn: false, user: null, token: null, isOwner: false };
  }
  
  return { isLoggedIn: true, user, token, isOwner };
}

export default {
  getAuthUrl,
  exchangeCodeForToken,
  login,
  logout,
  isLoggedIn,
  getAuthState,
  getToken,
  getUser,
};