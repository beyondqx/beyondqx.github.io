// src/components/ArticleForm.js
import React, { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import { CATEGORY_MAP } from '../config';

function ArticleForm({ initialData, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.categorySlug || 'tech');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }
    
    setSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onSubmit({
        title,
        content,
        categorySlug: category,
        tags: tagList,
        published,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="article-form">
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 18,
          }}
        />
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>内容 (Markdown)</label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="支持 Markdown 格式..."
        />
      </div>
      
      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--border-color)',
              borderRadius: 8,
            }}
          >
            {Object.entries(CATEGORY_MAP).map(([name, slug]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>标签</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="多个标签用逗号分隔"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--border-color)',
              borderRadius: 8,
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>立即发布（否则保存为草稿）</span>
        </label>
      </div>
      
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          disabled={submitting}
          className="admin-btn"
        >
          {submitting ? '保存中...' : (initialData ? '更新文章' : '发布文章')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}

export default ArticleForm;