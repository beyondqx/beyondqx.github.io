// src/config/constants.js
export const GITHUB_CONFIG = {
  OWNER: 'beyondqx',
  REPO: 'beyondqx.github.io',
  CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  REDIRECT_URI: `${window.location.origin}/#/login/callback`,
  SCOPES: 'public_repo read:user user:email',
  API_BASE: 'https://api.github.com',
  GRAPHQL_API: 'https://api.github.com/graphql',
};

export const DISCUSSION_CONFIG = {
  CATEGORY_NAME: 'Announcements',
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