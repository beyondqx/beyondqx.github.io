# GitHub Discussions 博客系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将纯静态博客改造为基于 GitHub Discussions 的全栈博客平台

**Architecture:** 前端 React + GitHub Pages，数据存储 GitHub Discussions，认证 GitHub OAuth

**Tech Stack:** React 18, React Router 6, GitHub GraphQL/REST API, GitHub OAuth

---

## 文件结构规划

### 新增文件

```
src/
├── config/
│   └── constants.js          # GitHub 配置常量
├── services/
│   ├── githubApi.js          # GitHub REST API 封装
│   ├── graphql.js            # GraphQL 查询封装
│   └── auth.js               # OAuth 认证逻辑
├── contexts/
│   └── AuthContext.js        # 全局登录状态
├── hooks/
│   └── useArticles.js        # 文章数据 Hook
│   └── useAuth.js            # 认证 Hook
├── components/
│   ├── LoginButton.js        # 登录按钮
│   ├── CommentSection.js     # 评论区
│   ├── MarkdownEditor.js     # Markdown 编辑器
│   ├── ArticleForm.js        # 文章表单
├── pages/
│   ├── LoginPage.js          # 登录页
│   ├── CallbackPage.js       # OAuth 回调页
│   ├── AdminPage.js          # 管理后台(改造)
│   ├── HomePage.js           # 首页(改造)
│   └── ArticlePage.js        # 文章页(改造)
├── utils/
│   └── articleUtils.js       # 文章数据转换
│   └── data.js               # 保留备用
```

---

## Task 1: 创建配置文件

**Files:**
- Create: `src/config/constants.js`
- Create: `src/config/index.js`

- [ ] **Step 1: 创建配置常量文件**

```javascript
// src/config/constants.js
export const GITHUB_CONFIG = {
  OWNER: 'beyondqx',
  REPO: 'beyondqx.github.io',
  CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  REDIRECT_URI: `${window.location.origin}/login/callback`,
  SCOPES: 'public_repo read:user user:email',
  API_BASE: 'https://api.github.com',
  GRAPHQL_API: 'https://api.github.com/graphql',
};

export const DISCUSSION_CONFIG = {
  CATEGORY_NAME: '博客文章',
  LABELS: {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    TECH: 'tech',
    LIFE: 'life',
    THOUGHTS: 'thoughts',
  },
};

export const CATEGORY_MAP = {
  '技术教程': 'tech',
  '生活随笔': 'life',
  '思考笔记': 'thoughts',
};
```

- [ ] **Step 2: 创建配置索引文件**

```javascript
// src/config/index.js
export * from './constants';
```

- [ ] **Step 3: 创建环境变量模板**

```bash
# .env.example
REACT_APP_GITHUB_CLIENT_ID=your_client_id_here
```

- [ ] **Step 4: 提交**

```bash
git add src/config/ .env.example
git commit -m "feat: add GitHub configuration files"
```

---

## Task 2: 创建 GraphQL 服务

**Files:**
- Create: `src/services/graphql.js`

- [ ] **Step 1: 创建 GraphQL 查询文件**

```javascript
// src/services/graphql.js
import { GITHUB_CONFIG } from '../config';

const GRAPHQL_ENDPOINT = GITHUB_CONFIG.GRAPHQL_API;

// 获取文章列表
export const GET_ARTICLES_QUERY = `
  query($owner: String!, $repo: String!, $first: Int!, $categoryId: ID) {
    repository(owner: $owner, name: $repo) {
      discussions(first: $first, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          number
          title
          body
          bodyHTML
          createdAt
          updatedAt
          author {
            login
            avatarUrl(size: 100)
          }
          labels(first: 10) {
            nodes {
              name
              color
            }
          }
          category {
            id
            name
          }
          comments(first: 100) {
            totalCount
            nodes {
              id
              body
              bodyHTML
              createdAt
              author {
                login
                avatarUrl(size: 50)
              }
              replyTo {
                id
              }
            }
          }
          reactions(first: 20) {
            totalCount
          }
        }
      }
      discussionCategory(name: "博客文章") {
        id
        name
      }
    }
  }
`;

// 获取单篇文章
export const GET_ARTICLE_QUERY = `
  query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      discussion(number: $number) {
        number
        title
        body
        bodyHTML
        createdAt
        updatedAt
        author {
          login
          avatarUrl(size: 100)
          url
        }
        labels(first: 10) {
          nodes {
            name
            color
          }
        }
        category {
          id
          name
        }
        comments(first: 100) {
          totalCount
          nodes {
            id
            body
            bodyHTML
            createdAt
            author {
              login
              avatarUrl(size: 50)
              url
            }
            replyTo {
              id
            }
          }
        }
      }
    }
  }
`;

// 获取分类列表
export const GET_CATEGORIES_QUERY = `
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 10) {
        nodes {
          id
          name
          slug
          description
        }
      }
    }
  }
`;

// GraphQL 请求函数
export async function graphqlQuery(query, variables, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}

// 获取文章列表
export async function fetchArticles(token = null, first = 20) {
  const result = await graphqlQuery(GET_ARTICLES_QUERY, {
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    first,
  }, token);
  
  return result.repository?.discussions || { nodes: [], totalCount: 0 };
}

// 获取单篇文章
export async function fetchArticle(number, token = null) {
  const result = await graphqlQuery(GET_ARTICLE_QUERY, {
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    number: parseInt(number),
  }, token);
  
  return result.repository?.discussion;
}

// 获取分类
export async function fetchCategories(token = null) {
  const result = await graphqlQuery(GET_CATEGORIES_QUERY, {
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
  }, token);
  
  return result.repository?.discussionCategories?.nodes || [];
}
```

- [ ] **Step 2: 提交**

```bash
git add src/services/graphql.js
git commit -m "feat: add GraphQL service for GitHub API"
```

---

## Task 3: 创建 REST API 服务

**Files:**
- Create: `src/services/githubApi.js`

- [ ] **Step 1: 创建 REST API 封装**

```javascript
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
  const endpoint = `/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/discussions/${number}/labels`;
  
  return apiRequest(endpoint, 'PUT', { labels }, token);
}

// 获取用户信息
export async function getUserInfo(token) {
  return apiRequest('/user', 'GET', null, token);
}

// 检查是否为仓库 Collaborator
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
```

- [ ] **Step 2: 提交**

```bash
git add src/services/githubApi.js
git commit -m "feat: add REST API service for GitHub operations"
```

---

## Task 4: 创建认证服务

**Files:**
- Create: `src/services/auth.js`

- [ ] **Step 1: 创建 OAuth 认证服务**

```javascript
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

// 用 code 交换 token
export async function exchangeCodeForToken(code) {
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
```

- [ ] **Step 2: 提交**

```bash
git add src/services/auth.js
git commit -m "feat: add OAuth authentication service"
```

---

## Task 5: 创建 AuthContext

**Files:**
- Create: `src/contexts/AuthContext.js`

- [ ] **Step 1: 创建认证上下文**

```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/contexts/AuthContext.js
git commit -m "feat: add AuthContext for global auth state"
```

---

## Task 6: 创建文章数据转换工具

**Files:**
- Create: `src/utils/articleUtils.js`

- [ ] **Step 1: 创建数据转换函数**

```javascript
// src/utils/articleUtils.js
import { DISCUSSION_CONFIG, CATEGORY_MAP } from '../config';

// 将 Discussion 转换为文章格式
export function discussionToArticle(discussion) {
  if (!discussion) return null;
  
  const labels = discussion.labels?.nodes || [];
  const isPublished = labels.some(l => l.name === DISCUSSION_CONFIG.LABELS.PUBLISHED);
  
  // 从标签提取分类
  const categoryLabels = labels.filter(l => 
    [DISCUSSION_CONFIG.LABELS.TECH, DISCUSSION_CONFIG.LABELS.LIFE, DISCUSSION_CONFIG.LABELS.THOUGHTS].includes(l.name)
  );
  const categorySlug = categoryLabels[0]?.name || 'tech';
  
  // 反向映射分类名称
  const categoryName = Object.entries(CATEGORY_MAP).find(
    ([_, slug]) => slug === categorySlug
  )?.[0] || '技术教程';
  
  // 从标签中移除系统标签，保留自定义标签
  const systemLabels = Object.values(DISCUSSION_CONFIG.LABELS);
  const customTags = labels
    .filter(l => !systemLabels.includes(l.name))
    .map(l => l.name);
  
  return {
    id: discussion.number,
    slug: String(discussion.number),
    title: discussion.title,
    content: discussion.body,
    contentHtml: discussion.bodyHTML,
    excerpt: getExcerpt(discussion.body, 150),
    author: discussion.author?.login || 'unknown',
    authorAvatar: discussion.author?.avatarUrl || '',
    authorUrl: discussion.author?.url || '',
    category: categoryName,
    categorySlug,
    tags: customTags,
    published: isPublished,
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt || discussion.createdAt,
    readTime: estimateReadTime(discussion.body),
    commentCount: discussion.comments?.totalCount || 0,
    comments: discussion.comments?.nodes || [],
    reactions: discussion.reactions?.totalCount || 0,
  };
}

// 获取摘要
function getExcerpt(body, maxLength = 150) {
  if (!body) return '';
  
  // 移除 Markdown 标记
  const text = body
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n/g, ' ')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 估算阅读时间
function estimateReadTime(body) {
  if (!body) return 1;
  const words = body.split(/\s+/).length;
  const chineseChars = (body.match(/[^\x00-\xff]/g) || []).length;
  const total = words + chineseChars;
  return Math.ceil(total / 400); // 约400字/分钟
}

// 将文章转换为 Discussion 格式
export function articleToDiscussion(article) {
  const labels = [];
  
  // 发布状态
  if (article.published) {
    labels.push(DISCUSSION_CONFIG.LABELS.PUBLISHED);
  } else {
    labels.push(DISCUSSION_CONFIG.LABELS.DRAFT);
  }
  
  // 分类
  const categorySlug = CATEGORY_MAP[article.category] || DISCUSSION_CONFIG.LABELS.TECH;
  labels.push(categorySlug);
  
  // 自定义标签
  if (article.tags) {
    labels.push(...article.tags);
  }
  
  return {
    title: article.title,
    body: article.content,
    labels,
  };
}

// 获取分类图标
export function getCategoryIcon(category) {
  const icons = {
    '技术教程': 'code',
    '生活随笔': 'favorite',
    '思考笔记': 'lightbulb',
  };
  return icons[category] || 'article';
}

// 获取分类颜色
export function getCategoryColor(category) {
  const colors = {
    '技术教程': '#667eea',
    '生活随笔': '#f5576c',
    '思考笔记': '#4facfe',
  };
  return colors[category] || '#667eea';
}

export default {
  discussionToArticle,
  articleToDiscussion,
  getCategoryIcon,
  getCategoryColor,
};
```

- [ ] **Step 2: 提交**

```bash
git add src/utils/articleUtils.js
git commit -m "feat: add article data transformation utilities"
```

---

## Task 7: 创建 useArticles Hook

**Files:**
- Create: `src/hooks/useArticles.js`

- [ ] **Step 1: 创建文章数据 Hook**

```javascript
// src/hooks/useArticles.js
import { useState, useEffect, useCallback } from 'react';
import { fetchArticles, fetchArticle } from '../services/graphql';
import { discussionToArticle } from '../utils/articleUtils';
import { useAuth } from '../contexts/AuthContext';

export function useArticles(options = {}) {
  const { first = 20, publishedOnly = true } = options;
  const { token } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchArticles(token, first);
      const nodes = result.nodes || [];
      
      let processedArticles = nodes.map(discussionToArticle);
      
      // 过滤未发布文章
      if (publishedOnly) {
        processedArticles = processedArticles.filter(a => a.published);
      }
      
      setArticles(processedArticles);
      setTotalCount(result.totalCount || processedArticles.length);
    } catch (e) {
      setError(e.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [token, first, publishedOnly]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return {
    articles,
    loading,
    error,
    totalCount,
    refetch: loadArticles,
  };
}

export function useArticle(number) {
  const { token } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setError(null);
      
      try {
        const discussion = await fetchArticle(number, token);
        setArticle(discussionToArticle(discussion));
      } catch (e) {
        setError(e.message);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    
    if (number) {
      loadArticle();
    }
  }, [number, token]);

  return {
    article,
    loading,
    error,
  };
}

export default { useArticles, useArticle };
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useArticles.js
git commit -m "feat: add useArticles hook for fetching articles"
```

---

## Task 8: 创建登录按钮组件

**Files:**
- Create: `src/components/LoginButton.js`

- [ ] **Step 1: 创建登录按钮**

```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/LoginButton.js
git commit -m "feat: add LoginButton component"
```

---

## Task 9: 创建登录页面

**Files:**
- Create: `src/pages/LoginPage.js`

- [ ] **Step 1: 创建登录页面**

```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/LoginPage.js
git commit -m "feat: add LoginPage component"
```

---

## Task 10: 创建 OAuth 回调页面

**Files:**
- Create: `src/pages/CallbackPage.js`

- [ ] **Step 1: 创建回调页面**

```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/CallbackPage.js
git commit -m "feat: add OAuth callback page"
```

---

## Task 11: 改造导航栏添加登录按钮

**Files:**
- Modify: `src/components/Navbar.js`

- [ ] **Step 1: 修改 Navbar 组件**

```javascript
// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSiteConfig } from '../utils/data';
import LoginButton from './LoginButton';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const config = getSiteConfig();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    const newTheme = !darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: '首页', icon: 'home' },
    { path: '/category/tech', label: '技术', icon: 'code' },
    { path: '/category/life', label: '生活', icon: 'favorite' },
    { path: '/admin', label: '管理', icon: 'settings' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand">
          {config.title.replace('的博客', '')}
        </Link>
        <button className="navbar-toggler" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="material-icons">menu</span>
        </button>
        <div className={`navbar-nav ${mobileMenuOpen ? 'show' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="material-icons">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <button className="nav-link theme-toggle" onClick={toggleDarkMode}>
            <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Navbar.js
git commit -m "feat: add LoginButton to Navbar"
```

---

## Task 12: 改造 App.js 添加路由和 Provider

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: 修改 App.js**

```javascript
// src/App.js
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/callback" element={<CallbackPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 2: 提交**

```bash
git add src/App.js
git commit -m "feat: add AuthProvider and new routes to App"
```

---

## Task 13: 改造 HomePage 使用新数据源

**Files:**
- Modify: `src/pages/HomePage.js`

- [ ] **Step 1: 改造 HomePage**

```javascript
// src/pages/HomePage.js
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/ArticleCard';

function HomePage() {
  const navigate = useNavigate();
  const { articles, loading, error, totalCount } = useArticles({ first: 20, publishedOnly: true });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [articles, searchQuery]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p className="loading-text">加载文章中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
          <p style={{ marginTop: 8, color: 'var(--text-tertiary)' }}>
            请确保 GitHub Discussions 已启用
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content container">
          <h1 className="hero-title">欢迎来到我的博客</h1>
          <p className="hero-subtitle">
            基于 GitHub Discussions 的全栈博客平台
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">文章</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{articles.length}</div>
              <div className="stat-label">已发布</div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="search-container">
          <span className="material-icons search-icon">search</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="articles-section container">
        <h2 className="section-title">
          <span className="material-icons">article</span>
          {searchQuery ? `搜索结果：${searchQuery}` : '最新文章'}
        </h2>
        {filteredArticles.length > 0 ? (
          <div className="articles-grid">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="material-icons">search_off</span>
            <p>没有找到相关文章</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/HomePage.js
git commit -m "feat: refactor HomePage to use GitHub Discussions data"
```

---

## Task 14: 改造 ArticlePage

**Files:**
- Modify: `src/pages/ArticlePage.js`
- Create: `src/components/CommentSection.js`

- [ ] **Step 1: 先创建 CommentSection**

```javascript
// src/components/CommentSection.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addComment } from '../services/githubApi';

function CommentSection({ articleNumber, comments = [], onCommentAdded }) {
  const { isLoggedIn, user, token } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;
    
    setSubmitting(true);
    try {
      await addComment(articleNumber, newComment, token);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      alert('评论失败: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section" style={{ marginTop: 48 }}>
      <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-icons">chat</span>
        评论 ({comments.length})
      </h3>
      
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            style={{
              width: '100%',
              minHeight: 100,
              padding: 16,
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              fontSize: 16,
              resize: 'vertical',
              marginBottom: 12,
            }}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="admin-btn"
          >
            {submitting ? '发送中...' : '发表评论'}
          </button>
        </form>
      ) : (
        <div style={{
          padding: 24,
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <p>登录后才能评论</p>
        </div>
      )}
      
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item" style={{
            padding: 16,
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <img
                src={comment.author?.avatarUrl}
                alt={comment.author?.login}
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              />
              <span style={{ fontWeight: 600 }}>{comment.author?.login}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {comment.bodyHTML ? (
                <div dangerouslySetInnerHTML={{ __html: comment.bodyHTML }} />
              ) : comment.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
```

- [ ] **Step 2: 改造 ArticlePage**

```javascript
// src/pages/ArticlePage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticle } from '../hooks/useArticles';
import CommentSection from '../components/CommentSection';

function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { article, loading, error } = useArticle(slug);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">draft</span>
          <h2>文章不存在</h2>
          <button className="admin-btn" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <article className="article-page fade-in">
        <header className="article-header">
          <span className="article-badge">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span>
              <span className="material-icons">calendar_today</span>
              {new Date(article.createdAt).toLocaleDateString('zh-CN')}
            </span>
            <span>
              <span className="material-icons">schedule</span>
              {article.readTime} 分钟
            </span>
            <span>
              <span className="material-icons">visibility</span>
              {article.reactions} 次阅读
            </span>
          </div>
        </header>
        
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.contentHtml || article.content }}
        />
        
        {article.tags?.length > 0 && (
          <div className="tags-section" style={{ background: 'transparent', marginTop: 32 }}>
            <div className="tags-container" style={{ justifyContent: 'flex-start' }}>
              {article.tags.map(tag => (
                <span key={tag} className="tag-pill">
                  <span className="material-icons">tag</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <CommentSection 
          articleNumber={parseInt(slug)}
          comments={article.comments}
        />
      </article>
    </div>
  );
}

export default ArticlePage;
```

- [ ] **Step 3: 提交**

```bash
git add src/components/CommentSection.js src/pages/ArticlePage.js
git commit -m "feat: add CommentSection and refactor ArticlePage"
```

---

## Task 15: 创建 Markdown 编辑器组件

**Files:**
- Create: `src/components/MarkdownEditor.js`

- [ ] **Step 1: 创建编辑器**

```javascript
// src/components/MarkdownEditor.js
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

function MarkdownEditor({ value, onChange, placeholder = '开始写作...' }) {
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(marked(value));
    } else {
      setPreview('');
    }
  }, [value]);

  const insertMarkdown = (syntax) => {
    const textarea = document.querySelector('.editor-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    
    let newValue;
    let newCursorPos;
    
    switch (syntax) {
      case 'bold':
        newValue = value.substring(0, start) + `**${selected || '粗体'}**` + value.substring(end);
        newCursorPos = start + 2 + selected.length;
        break;
      case 'italic':
        newValue = value.substring(0, start) + `*${selected || '斜体'}*` + value.substring(end);
        newCursorPos = start + 1 + selected.length;
        break;
      case 'code':
        newValue = value.substring(0, start) + `\`\`\`\n${selected || '代码'}\n\`\`\`` + value.substring(end);
        newCursorPos = start + 4;
        break;
      case 'link':
        newValue = value.substring(0, start) + `[${selected || '链接文字'}](url)` + value.substring(end);
        newCursorPos = start + 1 + selected.length;
        break;
      case 'image':
        newValue = value.substring(0, start) + `![${selected || '图片描述'}](图片URL)` + value.substring(end);
        newCursorPos = start + 2 + selected.length;
        break;
      case 'h1':
        newValue = value.substring(0, start) + `\n# ${selected || '标题'}\n` + value.substring(end);
        newCursorPos = start + 3;
        break;
      case 'h2':
        newValue = value.substring(0, start) + `\n## ${selected || '标题'}\n` + value.substring(end);
        newCursorPos = start + 4;
        break;
      case 'quote':
        newValue = value.substring(0, start) + `\n> ${selected || '引用'}\n` + value.substring(end);
        newCursorPos = start + 3;
        break;
      case 'list':
        newValue = value.substring(0, start) + `\n- ${selected || '列表项'}\n` + value.substring(end);
        newCursorPos = start + 3;
        break;
      default:
        return;
    }
    
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar" style={{
        display: 'flex',
        gap: 4,
        padding: 8,
        background: 'var(--bg-tertiary)',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <button onClick={() => insertMarkdown('h1')} title="标题" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>title</span>
        </button>
        <button onClick={() => insertMarkdown('bold')} title="粗体" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <strong style={{ fontSize: 14 }}>B</strong>
        </button>
        <button onClick={() => insertMarkdown('italic')} title="斜体" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <em style={{ fontSize: 14 }}>I</em>
        </button>
        <button onClick={() => insertMarkdown('code')} title="代码" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>code</span>
        </button>
        <button onClick={() => insertMarkdown('link')} title="链接" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>link</span>
        </button>
        <button onClick={() => insertMarkdown('image')} title="图片" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>image</span>
        </button>
        <button onClick={() => insertMarkdown('quote')} title="引用" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>format_quote</span>
        </button>
        <button onClick={() => insertMarkdown('list')} title="列表" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>format_list_bulleted</span>
        </button>
        <div style={{ flexGrow: 1 }} />
        <button onClick={() => setShowPreview(!showPreview)} title="预览" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>{showPreview ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 0 }}>
        <textarea
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: showPreview ? '50%' : '100%',
            minHeight: 300,
            padding: 16,
            border: '1px solid var(--border-color)',
            borderRadius: '0 0 0 8px',
            fontSize: 16,
            lineHeight: 1.6,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        {showPreview && (
          <div 
            className="editor-preview article-content"
            style={{
              width: '50%',
              minHeight: 300,
              padding: 16,
              border: '1px solid var(--border-color)',
              borderRadius: '0 0 8px 0',
              background: 'var(--bg-secondary)',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        )}
      </div>
    </div>
  );
}

export default MarkdownEditor;
```

- [ ] **Step 2: 提交**

```bash
git add src/components/MarkdownEditor.js
git commit -m "feat: add MarkdownEditor component"
```

---

## Task 16: 创建文章表单组件

**Files:**
- Create: `src/components/ArticleForm.js`

- [ ] **Step 1: 创建文章表单**

```javascript
// src/components/ArticleForm.js
import React, { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import { CATEGORY_MAP, DISCUSSION_CONFIG } from '../config';

function ArticleForm({ initialData, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.categorySlug || 'tech');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }
    
    setSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onSubmit({
        title,
        content,
        categorySlug: category,
        tags: tagList,
        published,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="article-form">
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 18,
          }}
        />
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>内容</label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="支持 Markdown 格式..."
        />
      </div>
      
      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--border-color)',
              borderRadius: 8,
            }}
          >
            {Object.entries(CATEGORY_MAP).map(([name, slug]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>标签</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="多个标签用逗号分隔"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--border-color)',
              borderRadius: 8,
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>立即发布（否则保存为草稿）</span>
        </label>
      </div>
      
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          disabled={submitting}
          className="admin-btn"
        >
          {submitting ? '保存中...' : (initialData ? '更新文章' : '发布文章')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}

export default ArticleForm;
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ArticleForm.js
git commit -m "feat: add ArticleForm component"
```

---

## Task 17: 完全改造管理后台

**Files:**
- Modify: `src/pages/AdminPage.js`

- [ ] **Step 1: 完全重写 AdminPage**

```javascript
// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { createDiscussion, updateDiscussion, deleteDiscussion, updateLabels } from '../services/githubApi';
import { fetchCategories } from '../services/graphql';
import { discussionToArticle, articleToDiscussion } from '../utils/articleUtils';
import { DISCUSSION_CONFIG } from '../config';
import ArticleForm from '../components/ArticleForm';

function AdminPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isOwner, token, user } = useAuth();
  const { articles, loading, refetch } = useArticles({ first: 50, publishedOnly: false });
  const [activeTab, setActiveTab] = useState('articles');
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    async function loadCategoryId() {
      const categories = await fetchCategories(token);
      const blogCategory = categories.find(c => c.name === DISCUSSION_CONFIG.CATEGORY_NAME);
      if (blogCategory) {
        setCategoryId(blogCategory.id);
      }
    }
    loadCategoryId();
  }, [token]);

  if (!isLoggedIn) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">lock</span>
          <h2>需要登录</h2>
          <p>请先登录才能访问管理后台</p>
          <button className="admin-btn" onClick={() => navigate('/login')}>
            前往登录
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">admin_panel_settings</span>
          <h2>权限不足</h2>
          <p>只有博主才能管理文章</p>
          <button className="admin-btn" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleCreate = async (data) => {
    if (!categoryId) {
      alert('未找到博客分类，请先在 GitHub 启用 Discussions');
      return;
    }
    const discussionData = articleToDiscussion(data);
    await createDiscussion(data.title, data.content, categoryId, discussionData.labels, token);
    setShowForm(false);
    refetch();
    alert('文章发布成功！');
  };

  const handleUpdate = async (data) => {
    await updateDiscussion(editingArticle.id, data.title, data.content, token);
    const discussionData = articleToDiscussion(data);
    await updateLabels(editingArticle.id, discussionData.labels, token);
    setEditingArticle(null);
    setShowForm(false);
    refetch();
    alert('文章更新成功！');
  };

  const handleDelete = async (number) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    await deleteDiscussion(number, token);
    refetch();
    alert('文章已删除');
  };

  const handleTogglePublish = async (article) => {
    const newLabels = article.published
      ? article.tags?.concat(DISCUSSION_CONFIG.LABELS.DRAFT) || [DISCUSSION_CONFIG.LABELS.DRAFT]
      : article.tags?.concat(DISCUSSION_CONFIG.LABELS.PUBLISHED) || [DISCUSSION_CONFIG.LABELS.PUBLISHED];
    await updateLabels(article.id, newLabels.filter(l => l !== (article.published ? DISCUSSION_CONFIG.LABELS.PUBLISHED : DISCUSSION_CONFIG.LABELS.DRAFT)), token);
    refetch();
  };

  if (showForm) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="admin-page">
          <h2 style={{ marginBottom: 24 }}>
            {editingArticle ? '编辑文章' : '新建文章'}
          </h2>
          <ArticleForm
            initialData={editingArticle}
            onSubmit={editingArticle ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingArticle(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page fade-in">
      <header className="admin-header">
        <h1>
          <span className="material-icons" style={{ marginRight: 8 }}>dashboard</span>
          管理后台
        </h1>
        <button className="admin-btn" onClick={() => setShowForm(true)}>
          <span className="material-icons">add</span>
          新建文章
        </button>
      </header>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id}>
                  <td><strong>{article.title}</strong></td>
                  <td>
                    <span className="badge" style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                    }}>
                      {article.category}
                    </span>
                  </td>
                  <td style={{ color: article.published ? 'green' : 'orange' }}>
                    {article.published ? '已发布' : '草稿'}
                  </td>
                  <td>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td>
                    <button onClick={() => navigate(`/article/${article.id}`)} style={{ marginRight: 8, padding: 4 }}>查看</button>
                    <button onClick={() => { setEditingArticle(article); setShowForm(true); }} style={{ marginRight: 8, padding: 4 }}>编辑</button>
                    <button onClick={() => handleTogglePublish(article)} style={{ marginRight: 8, padding: 4 }}>
                      {article.published ? '转为草稿' : '发布'}
                    </button>
                    <button onClick={() => handleDelete(article.id)} style={{ padding: 4, color: 'red' }}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/AdminPage.js
git commit -m "feat: fully refactor AdminPage with CRUD functionality"
```

---

## Task 18: 改造 CategoryPage

**Files:**
- Modify: `src/pages/CategoryPage.js`

- [ ] **Step 1: 改造 CategoryPage**

```javascript
// src/pages/CategoryPage.js
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/ArticleCard';
import { CATEGORY_MAP } from '../config';

function CategoryPage() {
  const { category } = useParams();
  const { articles, loading, error } = useArticles({ first: 50, publishedOnly: true });
  
  const categoryName = useMemo(() => {
    return Object.entries(CATEGORY_MAP).find(
      ([_, slug]) => slug === category
    )?.[0] || category;
  }, [category]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => a.categorySlug === category);
  }, [articles, category]);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">error</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <section className="articles-section">
        <h2 className="section-title">
          <span className="material-icons">folder</span>
          {categoryName}
        </h2>
        <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
          共 {filteredArticles.length} 篇文章
        </p>
        {filteredArticles.length > 0 ? (
          <div className="articles-grid">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="material-icons">folder_open</span>
            <p>该分类下暂无文章</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryPage;
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/CategoryPage.js
git commit -m "feat: refactor CategoryPage to use GitHub data"
```

---

## Task 19: 创建 hooks 索引文件

**Files:**
- Create: `src/hooks/index.js`

- [ ] **Step 1: 创建索引**

```javascript
// src/hooks/index.js
export { useArticles, useArticle } from './useArticles';
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/index.js
git commit -m "feat: add hooks index file"
```

---

## Task 20: 创建 services 索引文件

**Files:**
- Create: `src/services/index.js`

- [ ] **Step 1: 创建索引**

```javascript
// src/services/index.js
export * from './githubApi';
export * from './graphql';
export * from './auth';
```

- [ ] **Step 2: 提交**

```bash
git add src/services/index.js
git commit -m "feat: add services index file"
```

---

## Task 21: 构建并测试

- [ ] **Step 1: 安装依赖**

```bash
cd D:\qwen\beyondqx.github.io
npm install
```

- [ ] **Step 2: 本地启动测试**

```bash
npm start
```

Expected: 应用启动在 http://localhost:3000

- [ ] **Step 3: 构建生产版本**

```bash
npm run build
```

Expected: 构建成功，生成 build 目录

- [ ] **Step 4: 提交所有更改**

```bash
git add -A
git commit -m "feat: complete blog system refactoring"
```

---

## Task 22: 推送到 GitHub

- [ ] **Step 1: 推送代码**

```bash
git push origin main
```

Expected: 代码推送成功，触发 GitHub Actions 部署

---

## 后续配置步骤（需手动完成）

1. **启用 GitHub Discussions**
   - 进入仓库 Settings → Features → Discussions → Enable
   - 创建分类「博客文章」

2. **创建 OAuth App**
   - GitHub → Settings → Developer settings → OAuth Apps → New
   - 配置回调 URL 为 `https://beyondqx.github.io/#/login/callback`
   - 获取 Client ID 并配置到 `.env`

3. **创建初始标签**
   - 在 Discussions 中手动创建标签：published, draft, tech, life, thoughts

---

Plan completed. Save to `docs/superpowers/plans/2026-04-23-github-blog-implementation.md`