import React, { useState, useMemo } from 'react';
import { getArticles, getSiteConfig } from '../utils/data';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('articles');
  const articles = useMemo(() => getArticles(), []);
  const config = getSiteConfig();

  const tabs = [
    { id: 'articles', label: '文章管理', icon: 'article' },
    { id: 'settings', label: '站点设置', icon: 'settings' },
    { id: 'deploy', label: '部署指南', icon: 'cloud_upload' }
  ];

  return (
    <div className="admin-page fade-in">
      <header className="admin-header">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 8 }}>dashboard</span>
          管理后台
        </h1>
        <button className="admin-btn" onClick={() => window.open('https://github.com/beyondqx/beyondqx.github.io', '_blank')}>
          <span className="material-icons">open_in_new</span>
          GitHub 仓库
        </button>
      </header>

      {/* Tabs */}
      <div className="nav nav-tabs" style={{ marginBottom: 24, borderBottom: '2px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '12px 24px',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : 'none',
              marginBottom: -2
            }}
          >
            <span className="material-icons" style={{ marginRight: 8, verticalAlign: 'middle' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id}>
                  <td>
                    <strong>{article.title}</strong>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12
                    }}>
                      {article.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: article.published ? 'green' : 'orange' }}>
                      {article.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="admin-table" style={{ padding: 24 }}>
          <h3>站点信息</h3>
          <div className="mb-3" style={{ marginTop: 16 }}>
            <label className="form-label">博客标题</label>
            <input 
              type="text" 
              className="form-control" 
              defaultValue={config.title}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">副标题</label>
            <input 
              type="text" 
              className="form-control" 
              defaultValue={config.subtitle}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">作者</label>
            <input 
              type="text" 
              className="form-control" 
              defaultValue={config.author}
              readOnly
            />
          </div>
          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 8 }}>info</span>
            要修改站点配置，请编辑 <code>src/utils/data.js</code> 文件中的 <code>siteConfig</code> 对象。
          </div>
        </div>
      )}

      {/* Deploy Tab */}
      {activeTab === 'deploy' && (
        <div className="admin-table" style={{ padding: 24 }}>
          <h3>部署指南</h3>
          
          <div style={{ marginTop: 24 }}>
            <h5>方式一：GitHub Actions 自动部署（推荐）</h5>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              每次推送到 main 分支时，GitHub Actions 会自动构建并部署到 GitHub Pages。
            </p>
            <pre style={{ 
              background: '#1a1a2e', 
              padding: 16, 
              borderRadius: 8, 
              color: '#f8f8f2',
              marginTop: 12
            }}>
{`# 本地提交并推送
git add .
git commit -m "更新博客内容"
git push origin main`}
            </pre>
          </div>

          <div style={{ marginTop: 32 }}>
            <h5>方式二：手动构建部署</h5>
            <pre style={{ 
              background: '#1a1a2e', 
              padding: 16, 
              borderRadius: 8, 
              color: '#f8f8f2',
              marginTop: 12
            }}>
{`# 安装依赖
npm install

# 构建生产版本
npm run build

# 将 build 目录内容推送到 gh-pages 分支
# （可以使用 gh-pages 包自动化此过程）`}
            </pre>
          </div>

          <div className="alert alert-warning" style={{ marginTop: 24 }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 8 }}>warning</span>
            <strong>注意：</strong> 本博客是纯静态网站，所有数据在构建时生成。
            如需添加新文章，请创建 Markdown 文件并更新 <code>src/utils/data.js</code>。
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
