// src/components/CommentSection.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addComment } from '../services/githubApi';

function CommentSection({ articleNumber, comments = [], onCommentAdded }) {
  const { isLoggedIn, token } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;
    
    setSubmitting(true);
    try {
      await addComment(articleNumber, newComment, token);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      alert('评论失败: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section" style={{ marginTop: 48 }}>
      <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-icons">chat</span>
        评论 ({comments.length})
      </h3>
      
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            style={{
              width: '100%',
              minHeight: 100,
              padding: 16,
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              fontSize: 16,
              resize: 'vertical',
              marginBottom: 12,
            }}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="admin-btn"
          >
            {submitting ? '发送中...' : '发表评论'}
          </button>
        </form>
      ) : (
        <div style={{
          padding: 24,
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <p style={{ marginBottom: 8 }}>登录后才能评论</p>
          <a href="/#/login" className="admin-btn" style={{ display: 'inline-block' }}>
            前往登录
          </a>
        </div>
      )}
      
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item" style={{
            padding: 16,
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <img
                src={comment.author?.avatarUrl}
                alt={comment.author?.login}
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              />
              <span style={{ fontWeight: 600 }}>{comment.author?.login}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {comment.bodyHTML ? (
                <div dangerouslySetInnerHTML={{ __html: comment.bodyHTML }} />
              ) : comment.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;