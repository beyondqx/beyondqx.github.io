// src/services/githubApi.js
import { GITHUB_CONFIG } from '../config';

const API_BASE = GITHUB_CONFIG.API_BASE;

// 通用请求函数
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json().catch(() => null);
}

// 创建 Discussion (文章)
export async function createDiscussion(title, body, categoryId, labels = [], token) {
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/discussions`;
  
  return apiRequest(endpoint, 'POST', {
    title,
    body,
    category_id: categoryId,
    labels,
  }, token);
}

// 更新 Discussion (文章)
export async function updateDiscussion(number, title, body, token) {
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/discussions/${number}`;
  
  return apiRequest(endpoint, 'PATCH', {
    title,
    body,
  }, token);
}

// 删除 Discussion (文章)
export async function deleteDiscussion(number, token) {
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/discussions/${number}`;
  
  return apiRequest(endpoint, 'DELETE', null, token);
}

// 添加评论
export async function addComment(number, body, token) {
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/discussions/${number}/comments`;
  
  return apiRequest(endpoint, 'POST', { body }, token);
}

// 删除评论
export async function deleteComment(number, commentId, token) {
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/discussions/${number}/comments/${commentId}`;
  
  return apiRequest(endpoint, 'DELETE', null, token);
}

// 更新标签
export async function updateLabels(number, labels, token) {
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/issues/${number}/labels`;
  
  return apiRequest(endpoint, 'PUT', { labels }, token);
}

// 获取用户信息
export async function getUserInfo(token) {
  return apiRequest('/user', 'GET', null, token);
}

// 检查是否为仓库 Owner
export async function checkCollaborator(token) {
  const user = await getUserInfo(token);
  return user.login === GITHUB_CONFIG.OWNER;
}

export default {
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  deleteComment,
  updateLabels,
  getUserInfo,
  checkCollaborator,
};