/**
 * 数据管理工具 - 使用本地 JSON 文件存储数据
 * 在 GitHub Pages 环境中，数据存储在 data 目录
 */

// 模拟数据库（实际使用时通过 GitHub API 或构建时生成）
const DATA_VERSION = '1.0.0';

// 初始示例数据
export const initialData = {
  articles: [
    {
      id: '1',
      slug: 'hello-world',
      title: '在 Windows 里原生安装 openclaw',
      excerpt: '本文将详细介绍如何在 Windows 系统上原生安装 openclaw 工具...',
      content: `# 在 Windows 里原生安装 openclaw

## 前言

openclaw 是一个强大的命令行工具，但在 Windows 上安装可能会遇到一些挑战。本文将详细介绍完整的安装过程。

## 步骤一：安装依赖

首先需要安装以下依赖：

\`\`\`bash
# 安装 Git for Windows
winget install Git.Git

# 安装 Python
winget install Python.Python.3.11
\`\`\`

## 步骤二：克隆仓库

\`\`\`bash
git clone https://github.com/example/openclaw.git
cd openclaw
\`\`\`

## 步骤三：配置环境

创建虚拟环境并安装依赖：

\`\`\`bash
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

## 总结

完成以上步骤后，openclaw 就可以在 Windows 上正常使用了。

> 提示：如果遇到路径问题，请确保使用管理员权限运行终端。
`,
      category: '技术教程',
      tags: ['Windows', '工具', '教程'],
      coverImage: null,
      published: true,
      createdAt: '2026-03-10T10:00:00Z',
      updatedAt: '2026-03-10T10:00:00Z',
      readTime: 5
    }
  ],
  categories: [
    { id: '1', name: '技术教程', slug: 'tech-tutorial', description: '技术相关的教程和指南' },
    { id: '2', name: '生活随笔', slug: 'life', description: '生活中的感悟和记录' },
    { id: '3', name: '思考笔记', slug: 'thoughts', description: '深度思考和总结' }
  ],
  tags: [
    { id: '1', name: 'Windows', slug: 'windows', count: 1 },
    { id: '2', name: '工具', slug: 'tools', count: 1 },
    { id: '3', name: '教程', slug: 'tutorial', count: 1 }
  ],
  siteConfig: {
    title: 'beyondqx 的博客',
    subtitle: '分享技术、生活与思考',
    author: 'beyondqx',
    avatar: '/avatar.png',
    social: {
      github: 'https://github.com/beyondqx',
      twitter: '',
      email: ''
    }
  }
};

/**
 * 获取所有文章
 */
export const getArticles = () => {
  try {
    // 在实际环境中，这里会从 data/articles.json 读取
    // 或者通过 GitHub API 获取
    return initialData.articles
      .filter(article => article.published)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
};

/**
 * 根据 slug 获取单篇文章
 */
export const getArticleBySlug = (slug) => {
  try {
    return initialData.articles.find(article => article.slug === slug);
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
};

/**
 * 获取所有分类
 */
export const getCategories = () => {
  return initialData.categories;
};

/**
 * 获取分类下的文章
 */
export const getArticlesByCategory = (categorySlug) => {
  return initialData.articles
    .filter(article => article.category?.toLowerCase().replace(/\\s+/g, '-') === categorySlug && article.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * 获取所有标签
 */
export const getTags = () => {
  return initialData.tags;
};

/**
 * 获取标签下的文章
 */
export const getArticlesByTag = (tagSlug) => {
  return initialData.articles
    .filter(article => article.tags?.some(tag => tag.toLowerCase().replace(/\\s+/g, '-') === tagSlug) && article.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * 搜索文章
 */
export const searchArticles = (query) => {
  if (!query) return getArticles();
  
  const lowerQuery = query.toLowerCase();
  return initialData.articles.filter(article => 
    article.published && (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  );
};

/**
 * 获取站点配置
 */
export const getSiteConfig = () => {
  return initialData.siteConfig;
};

/**
 * 统计数据
 */
export const getStats = () => {
  const articles = initialData.articles.filter(a => a.published);
  const categories = initialData.categories;
  const tags = initialData.tags;
  
  return {
    articleCount: articles.length,
    categoryCount: categories.length,
    tagCount: tags.length,
    totalWords: articles.reduce((sum, article) => sum + (article.content?.length || 0), 0)
  };
};

export default {
  getArticles,
  getArticleBySlug,
  getCategories,
  getArticlesByCategory,
  getTags,
  getArticlesByTag,
  searchArticles,
  getSiteConfig,
  getStats,
  initialData
};
