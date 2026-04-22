import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleBySlug, getArticles } from '../utils/data';
import { markdownToHtml } from '../utils/markdown';

function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const article = useMemo(() => getArticleBySlug(slug), [slug]);

  useEffect(() => {
    if (!article) {
      setLoading(false);
    } else {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  }, [article]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">draft</span>
          <h2>文章不存在</h2>
          <p>这篇文章可能已被删除或尚未发布</p>
          <button className="admin-btn" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const htmlContent = markdownToHtml(article.content);

  const relatedArticles = getArticles()
    .filter(a => 
      a.id !== article.id && 
      a.category === article.category
    )
    .slice(0, 3);

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <article className="article-page fade-in">
        <header className="article-header">
          <span className="article-badge">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span>
              <span className="material-icons" style={{ verticalAlign: 'middle' }}>calendar_today</span>
              {new Date(article.createdAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span>
              <span className="material-icons" style={{ verticalAlign: 'middle' }}>schedule</span>
              阅读时间：约 {article.readTime || 5} 分钟
            </span>
          </div>
        </header>

        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="tags-section" style={{ background: 'transparent', paddingTop: 20 }}>
            <div className="tags-container">
              {article.tags.map((tag, index) => (
                <span key={index} className="tag-pill">
                  <span className="material-icons">tag</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <h3 style={{ marginBottom: 24, fontSize: 1.5 }}>相关文章</h3>
            <div className="articles-grid">
              {relatedArticles.map(relatedArticle => (
                <div 
                  key={relatedArticle.id}
                  className="article-card"
                  onClick={() => navigate(`/article/${relatedArticle.slug}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="article-card-image" style={{ height: 150 }}>
                    <span className="article-card-category">{relatedArticle.category}</span>
                  </div>
                  <div className="article-card-content">
                    <h4 className="article-card-title" style={{ fontSize: 1.1 }}>
                      {relatedArticle.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

export default ArticlePage;
