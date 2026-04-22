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
          <p>{error || '这篇文章可能已被删除'}</p>
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
              <img 
                src={article.authorAvatar} 
                alt={article.author}
                style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 6 }}
              />
              {article.author}
            </span>
            <span>
              <span className="material-icons">calendar_today</span>
              {new Date(article.createdAt).toLocaleDateString('zh-CN')}
            </span>
            <span>
              <span className="material-icons">schedule</span>
              {article.readTime} 分钟
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