import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { createDiscussion, updateDiscussion, deleteDiscussion, updateLabels } from '../services/githubApi';
import { fetchCategories } from '../services/graphql';
import { articleToDiscussion } from '../utils/articleUtils';
import { DISCUSSION_CONFIG } from '../config';
import ArticleForm from '../components/ArticleForm';

function AdminPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isOwner, token } = useAuth();
  const { articles, loading, refetch } = useArticles({ first: 50, publishedOnly: false });
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    async function loadCategoryId() {
      const categories = await fetchCategories(token);
      const blogCategory = categories.find(c => c.name === DISCUSSION_CONFIG.CATEGORY_NAME);
      if (blogCategory) {
        setCategoryId(blogCategory.id);
      }
    }
    loadCategoryId();
  }, [token]);

  if (!isLoggedIn) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">lock</span>
          <h2>需要登录</h2>
          <p>请先登录才能访问管理后台</p>
          <button className="admin-btn" onClick={() => navigate('/login')}>
            前往登录
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="empty-state">
          <span className="material-icons">admin_panel_settings</span>
          <h2>权限不足</h2>
          <p>只有博主才能管理文章</p>
          <button className="admin-btn" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleCreate = async (data) => {
    if (!categoryId) {
      alert('未找到博客分类，请先在 GitHub 启用 Discussions 并创建「博客文章」分类');
      return;
    }
    const discussionData = articleToDiscussion(data);
    await createDiscussion(data.title, data.content, categoryId, discussionData.labels, token);
    setShowForm(false);
    refetch();
    alert('文章发布成功！');
  };

  const handleUpdate = async (data) => {
    await updateDiscussion(editingArticle.id, data.title, data.content, token);
    const discussionData = articleToDiscussion(data);
    await updateLabels(editingArticle.id, discussionData.labels, token);
    setEditingArticle(null);
    setShowForm(false);
    refetch();
    alert('文章更新成功！');
  };

  const handleDelete = async (number) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    await deleteDiscussion(number, token);
    refetch();
    alert('文章已删除');
  };

  const handleTogglePublish = async (article) => {
    const newLabels = article.published
      ? article.tags?.concat([DISCUSSION_CONFIG.LABELS.DRAFT]) || [DISCUSSION_CONFIG.LABELS.DRAFT]
      : article.tags?.concat([DISCUSSION_CONFIG.LABELS.PUBLISHED]) || [DISCUSSION_CONFIG.LABELS.PUBLISHED];
    
    const filteredLabels = newLabels.filter(l => 
      l !== (article.published ? DISCUSSION_CONFIG.LABELS.PUBLISHED : DISCUSSION_CONFIG.LABELS.DRAFT)
    );
    
    await updateLabels(article.id, filteredLabels, token);
    refetch();
  };

  if (showForm) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="article-page">
          <h2 style={{ marginBottom: 24 }}>
            {editingArticle ? '编辑文章' : '新建文章'}
          </h2>
          <ArticleForm
            initialData={editingArticle}
            onSubmit={editingArticle ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingArticle(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page fade-in">
      <header className="admin-header">
        <h1>
          <span className="material-icons" style={{ marginRight: 8 }}>dashboard</span>
          管理后台
        </h1>
        <button className="admin-btn" onClick={() => setShowForm(true)}>
          <span className="material-icons">add</span>
          新建文章
        </button>
      </header>

      {!categoryId && (
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16 }}>
          <p style={{ color: 'orange' }}>
            ⚠️ 未检测到「博客文章」分类，请前往 GitHub Discussions 创建该分类
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id}>
                  <td><strong>{article.title}</strong></td>
                  <td>
                    <span style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                    }}>
                      {article.category}
                    </span>
                  </td>
                  <td style={{ color: article.published ? 'green' : 'orange' }}>
                    {article.published ? '已发布' : '草稿'}
                  </td>
                  <td>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td>
                    <button onClick={() => navigate(`/article/${article.id}`)} style={{ marginRight: 8, padding: 4, border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer' }}>查看</button>
                    <button onClick={() => { setEditingArticle(article); setShowForm(true); }} style={{ marginRight: 8, padding: 4, border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer' }}>编辑</button>
                    <button onClick={() => handleTogglePublish(article)} style={{ marginRight: 8, padding: 4, border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer' }}>
                      {article.published ? '转草稿' : '发布'}
                    </button>
                    <button onClick={() => handleDelete(article.id)} style={{ padding: 4, color: 'red', border: '1px solid red', borderRadius: 4, cursor: 'pointer' }}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;