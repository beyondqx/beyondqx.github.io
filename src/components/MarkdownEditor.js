// src/components/MarkdownEditor.js
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

function MarkdownEditor({ value, onChange, placeholder = '开始写作...' }) {
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(marked(value));
    } else {
      setPreview('');
    }
  }, [value]);

  const insertMarkdown = (syntax) => {
    const textarea = document.querySelector('.editor-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    
    let newValue;
    let newCursorPos;
    
    switch (syntax) {
      case 'bold':
        newValue = value.substring(0, start) + `**${selected || '粗体'}**` + value.substring(end);
        newCursorPos = start + 2 + selected.length;
        break;
      case 'italic':
        newValue = value.substring(0, start) + `*${selected || '斜体'}*` + value.substring(end);
        newCursorPos = start + 1 + selected.length;
        break;
      case 'code':
        newValue = value.substring(0, start) + `\`\`\`\n${selected || '代码'}\n\`\`\`` + value.substring(end);
        newCursorPos = start + 4;
        break;
      case 'link':
        newValue = value.substring(0, start) + `[${selected || '链接文字'}](url)` + value.substring(end);
        newCursorPos = start + 1 + selected.length;
        break;
      case 'image':
        newValue = value.substring(0, start) + `![${selected || '图片描述'}](图片URL)` + value.substring(end);
        newCursorPos = start + 2 + selected.length;
        break;
      case 'h1':
        newValue = value.substring(0, start) + `\n# ${selected || '标题'}\n` + value.substring(end);
        newCursorPos = start + 3;
        break;
      case 'h2':
        newValue = value.substring(0, start) + `\n## ${selected || '标题'}\n` + value.substring(end);
        newCursorPos = start + 4;
        break;
      case 'quote':
        newValue = value.substring(0, start) + `\n> ${selected || '引用'}\n` + value.substring(end);
        newCursorPos = start + 3;
        break;
      case 'list':
        newValue = value.substring(0, start) + `\n- ${selected || '列表项'}\n` + value.substring(end);
        newCursorPos = start + 3;
        break;
      default:
        return;
    }
    
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar" style={{
        display: 'flex',
        gap: 4,
        padding: 8,
        background: 'var(--bg-tertiary)',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <button onClick={() => insertMarkdown('h1')} title="标题" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>title</span>
        </button>
        <button onClick={() => insertMarkdown('bold')} title="粗体" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <strong style={{ fontSize: 14 }}>B</strong>
        </button>
        <button onClick={() => insertMarkdown('italic')} title="斜体" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <em style={{ fontSize: 14 }}>I</em>
        </button>
        <button onClick={() => insertMarkdown('code')} title="代码" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>code</span>
        </button>
        <button onClick={() => insertMarkdown('link')} title="链接" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>link</span>
        </button>
        <button onClick={() => insertMarkdown('image')} title="图片" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>image</span>
        </button>
        <button onClick={() => insertMarkdown('quote')} title="引用" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>format_quote</span>
        </button>
        <button onClick={() => insertMarkdown('list')} title="列表" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>format_list_bulleted</span>
        </button>
        <div style={{ flexGrow: 1 }} />
        <button onClick={() => setShowPreview(!showPreview)} title="预览" style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>{showPreview ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 0 }}>
        <textarea
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: showPreview ? '50%' : '100%',
            minHeight: 300,
            padding: 16,
            border: '1px solid var(--border-color)',
            borderRadius: '0 0 0 8px',
            fontSize: 16,
            lineHeight: 1.6,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        {showPreview && (
          <div 
            className="editor-preview article-content"
            style={{
              width: '50%',
              minHeight: 300,
              padding: 16,
              border: '1px solid var(--border-color)',
              borderRadius: '0 0 8px 0',
              background: 'var(--bg-secondary)',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        )}
      </div>
    </div>
  );
}

export default MarkdownEditor;