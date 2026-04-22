# 博客使用指南

## 📖 快速开始

### 1. 首次设置

```bash
# 进入项目目录
cd D:\qwen\beyondqx.github.io

# 安装依赖（如果还没有安装）
npm install
```

### 2. 本地开发

```bash
# 启动开发服务器
npm start
```

浏览器访问 `http://localhost:3000`

### 3. 创建新文章

```bash
# 使用自动化脚本
npm run new-article -- "我的文章标题"
```

脚本会自动：
- 在 `src/utils/data.js` 中添加文章数据
- 在 `articles/` 目录创建 Markdown 备份

### 4. 编辑文章

打开 `src/utils/data.js`，找到 `initialData.articles` 数组：

```javascript
{
  id: 'unique-id',
  slug: 'my-article',          // 文章 URL 标识
  title: '文章标题',
  excerpt: '文章摘要...',        // 卡片显示的简介
  content: `# 文章内容`,         // Markdown 格式
  category: '技术教程',          // 分类
  tags: ['标签 1', '标签 2'],    // 标签数组
  published: true,              // true=发布，false=草稿
  createdAt: '2026-04-23T10:00:00Z',
  readTime: 5                   // 预计阅读时间（分钟）
}
```

### 5. 修改站点配置

编辑 `src/utils/data.js` 中的 `siteConfig`：

```javascript
siteConfig: {
  title: 'beyondqx 的博客',
  subtitle: '分享技术、生活与思考',
  author: 'beyondqx',
  social: {
    github: 'https://github.com/beyondqx',
    twitter: '你的 Twitter',
    email: '你的邮箱'
  }
}
```

### 6. 添加新分类

编辑 `src/utils/data.js` 中的 `categories`：

```javascript
categories: [
  { id: '1', name: '技术教程', slug: 'tech-tutorial', description: '技术教程' },
  { id: '2', name: '生活随笔', slug: 'life', description: '生活感悟' },
  { id: '3', name: '思考笔记', slug: 'thoughts', description: '深度思考' }
]
```

## 🚀 部署到 GitHub Pages

### 方式一：GitHub Actions（推荐）

1. 确保代码已推送到 GitHub 仓库的 `main` 分支
2. GitHub Actions 会自动构建并部署
3. 访问 `https://beyondqx.github.io` 查看博客

```bash
# 提交并推送
git add .
git commit -m "更新博客内容"
git push origin main
```

### 方式二：手动部署

```bash
# 构建
npm run build

# 部署到 gh-pages 分支
npm run deploy
```

## 📝 Markdown 语法支持

文章支持完整的 Markdown 语法：

```markdown
# 标题

## 二级标题

### 三级标题

**粗体** *斜体* `行内代码`

[链接](https://example.com)

![图片](image.png)

- 列表项 1
- 列表项 2

1. 有序列表 1
2. 有序列表 2

> 引用内容

```javascript
// 代码块
function hello() {
  console.log('Hello World!');
}
```

| 表格 | 示例 |
|------|------|
| 单元格 | 内容 |
```

## 🎨 自定义样式

编辑 `src/styles/index.css` 可以修改：
- 颜色主题（修改 CSS 变量）
- 字体大小
- 布局间距
- 动画效果

## 📊 管理后台

访问 `/admin` 路径进入管理后台：
- **文章管理**：查看所有文章列表
- **站点设置**：查看和编辑配置
- **部署指南**：查看部署说明

## ⚠️ 注意事项

1. **Slug 唯一性**：确保每篇文章的 `slug` 是唯一的
2. **发布状态**：`published: false` 的文章不会在列表中显示
3. **图片路径**：使用绝对路径或外部图床
4. **构建后部署**：每次修改后需要重新构建并推送

## 🔧 故障排除

### 本地启动失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm start
```

### 构建失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules build
npm install
npm run build
```

### GitHub Pages 不更新

1. 检查 GitHub Actions 是否运行成功
2. 清除浏览器缓存
3. 访问 `https://beyondqx.github.io/?t=时间戳` 强制刷新

## 📞 获取帮助

- 查看 `README.md` 了解项目结构
- 查看 `src/utils/data.js` 了解数据格式
- 查看 `src/components` 了解组件实现
