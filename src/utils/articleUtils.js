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