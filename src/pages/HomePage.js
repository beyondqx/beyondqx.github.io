import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles, getCategories, getTags, getStats } from '../utils/data';
import ArticleCard from '../components/ArticleCard';

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const articles = useMemo(() => getArticles(), []);
  const categories = useMemo(() => getCategories(), []);
  const tags = useMemo(() => getTags(), []);
  const stats = useMemo(() => getStats(), []);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [articles, searchQuery]);

  const handleTagClick = (tagSlug) => {
    console.log('Tag clicked:', tagSlug);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content container">
          <h1 className="hero-title">欢迎来到我的博客</h1>
          <p className="hero-subtitle">
            在这里，我分享技术心得、生活感悟和深度思考。
            希望这些文字能为你带来价值和启发。
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.articleCount}</div>
              <div className="stat-label">文章</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.categoryCount}</div>
              <div className="stat-label">分类</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.tagCount}</div>
              <div className="stat-label">标签</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <span className="material-icons search-icon">search</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索文章、标签或关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Articles Section */}
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

      {/* Tags Section */}
      <section className="tags-section">
        <div className="container">
          <h2 className="section-title" style={{ justifyContent: 'center' }}>
            <span className="material-icons">local_offer</span>
            热门标签
          </h2>
          <div className="tags-container">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="tag-pill"
                onClick={() => handleTagClick(tag.slug)}
              >
                <span className="material-icons">tag</span>
                {tag.name}
                <span className="tag-count">{tag.count}</span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
