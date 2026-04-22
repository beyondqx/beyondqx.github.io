import React from 'react';
import { useNavigate } from 'react-router-dom';

function ArticleCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${article.slug}`);
  };

  return (
    <div className="article-card fade-in" onClick={handleClick}>
      <div className="article-card-image">
        <span className="article-card-category">
          {article.category || '未分类'}
        </span>
      </div>
      <div className="article-card-content">
        <h3 className="article-card-title">{article.title}</h3>
        <p className="article-card-excerpt">{article.excerpt}</p>
        <div className="article-card-meta">
          <span className="article-card-date">
            <span className="material-icons" style={{ fontSize: 16 }}>calendar_today</span>
            {new Date(article.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="article-card-read">
            阅读更多
            <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;
