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