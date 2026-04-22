import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('代码高亮失败:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  }
});

// 自定义渲染器
const renderer = new marked.Renderer();

// 链接渲染
renderer.link = function(href, title, text) {
  const target = href.startsWith('http') ? '_blank' : '_self';
  const rel = target === '_blank' ? 'noopener noreferrer' : '';
  return `<a href="${href}" target="${target}" rel="${rel}" title="${title || ''}">${text}</a>`;
};

// 图片渲染
renderer.image = function(href, title, text) {
  return `<img src="${href}" alt="${text}" title="${title || ''}" loading="lazy" />`;
};

// 代码块渲染
renderer.code = function(code, language) {
  const validLang = language && hljs.getLanguage(language);
  const highlighted = validLang 
    ? hljs.highlight(code, { language }).value 
    : hljs.highlightAuto(code).value;
  return `<pre><code class="hljs language-${language || 'plaintext'}">${highlighted}</code></pre>`;
};

// 引用渲染
renderer.blockquote = function(quote) {
  return `<blockquote class="blockquote">${quote}</blockquote>`;
};

// 设置自定义渲染器
marked.use({ renderer });

/**
 * 将 Markdown 转换为 HTML
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  return marked(markdown);
};

/**
 * 提取 Markdown 纯文本（用于摘要）
 */
export const extractPlainText = (markdown, maxLength = 200) => {
  if (!markdown) return '';
  
  // 移除代码块
  let text = markdown.replace(/```[\\s\\S]*?```/g, '');
  // 移除行内代码
  text = text.replace(/`[^`]*`/g, '');
  // 移除图片
  text = text.replace(/!\\[.*?\\]\\(.*?\\)/g, '');
  // 移除链接但保留文字
  text = text.replace(/\\[(.*?)\\]\\(.*?\\)/g, '$1');
  // 移除标题标记
  text = text.replace(/^#+\\s*/gm, '');
  // 移除列表标记
  text = text.replace(/^[\\-\\*\\+]\\s*/gm, '');
  text = text.replace(/^\\d+\\.\\s*/gm, '');
  // 移除引用标记
  text = text.replace(/^>\\s*/gm, '');
  // 移除 HTML 标签
  text = text.replace(/<[^>]*>/g, '');
  // 移除多余空白
  text = text.replace(/\\s+/g, ' ').trim();
  
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

/**
 * 计算阅读时间（分钟）
 */
export const calculateReadTime = (markdown) => {
  const plainText = extractPlainText(markdown);
  const words = plainText.split(/\\s+/).length;
  // 中文按字符数计算，英文按单词数计算
  const chineseChars = (markdown.match(/[\\u4e00-\\u9fa5]/g) || []).length;
  const englishWords = words - chineseChars;
  // 假设每分钟阅读 300 个中文字符或 200 个英文单词
  const readTime = Math.ceil(chineseChars / 300 + englishWords / 200);
  return Math.max(1, readTime);
};

/**
 * 从 Markdown 提取封面图
 */
export const extractCoverImage = (markdown) => {
  const match = markdown.match(/!\\[.*?\\]\\((.*?)\\)/);
  return match ? match[1] : null;
};

export default {
  markdownToHtml,
  extractPlainText,
  calculateReadTime,
  extractCoverImage
};
