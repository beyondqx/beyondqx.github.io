import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getArticlesByCategory, getCategories } from '../utils/data';
import ArticleCard from '../components/ArticleCard';

function CategoryPage() {
  const { category } = useParams();
  
  const articles = useMemo(() => getArticlesByCategory(category), [category]);
  const categories = useMemo(() => getCategories(), []);
  
  const currentCategory = categories.find(c => c.slug === category);

  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <div className="articles-section">
        <h2 className="section-title">
          <span className="material-icons">folder</span>
          {currentCategory?.name || category}
        </h2>
        
        {currentCategory?.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            {currentCategory.description}
          </p>
        )}

        {articles.length > 0 ? (
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="material-icons">folder_open</span>
            <p>该分类下暂无文章</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
