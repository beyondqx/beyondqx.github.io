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
            请确保 GitHub Discussions 已启用并创建「博客文章」分类
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
            基于 GitHub Discussions 的全栈博客平台，支持在线管理和评论互动
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