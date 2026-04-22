# beyondqx 的博客

一个基于 React + GitHub Pages 构建的现代化静态博客系统。

## ✨ 特性

- 🎨 **精美 UI 设计** - 采用渐变色、Material Design 和响应式布局
- 📝 **Markdown 支持** - 完整的 Markdown 语法渲染，支持代码高亮
- 🔍 **全文搜索** - 实时搜索文章标题、内容和标签
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🚀 **自动部署** - GitHub Actions 自动构建和部署
- 🏷️ **分类标签** - 支持文章分类和标签管理
- ⚡ **高性能** - 静态网站，极速加载

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm start
```

浏览器访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

### 创建新文章

```bash
npm run new-article -- "文章标题"
```

## 📁 项目结构

```
beyondqx.github.io/
├── public/                 # 静态资源
├── src/
│   ├── components/        # React 组件
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── ArticleCard.js
│   ├── pages/             # 页面组件
│   │   ├── HomePage.js
│   │   ├── ArticlePage.js
│   │   ├── CategoryPage.js
│   │   └── AdminPage.js
│   ├── utils/             # 工具函数
│   │   ├── data.js        # 数据管理
│   │   └── markdown.js    # Markdown 渲染
│   ├── styles/            # 全局样式
│   └── App.js             # 应用入口
├── scripts/               # 自动化脚本
│   └── new-article.js     # 新建文章脚本
├── data/                  # 数据文件
├── articles/              # Markdown 文章备份
└── .github/workflows/     # GitHub Actions
```

## 📝 如何添加文章

### 方式一：使用脚本（推荐）

```bash
npm run new-article -- "我的新文章"
```

然后编辑 `src/utils/data.js` 中的文章信息。

### 方式二：手动编辑

1. 打开 `src/utils/data.js`
2. 在 `articles` 数组中添加新文章对象：

```javascript
{
  id: 'unique-id',
  slug: 'my-article',
  title: '文章标题',
  excerpt: '文章摘要...',
  content: `# 文章内容`,
  category: '技术教程',
  tags: ['标签 1', '标签 2'],
  published: true,
  createdAt: '2026-04-23T10:00:00Z',
  readTime: 5
}
```

## 🎨 自定义配置

编辑 `src/utils/data.js` 中的 `siteConfig`：

```javascript
siteConfig: {
  title: 'beyondqx 的博客',
  subtitle: '分享技术、生活与思考',
  author: 'beyondqx',
  social: {
    github: 'https://github.com/beyondqx',
    twitter: '',
    email: ''
  }
}
```

## 📦 部署

### GitHub Pages 自动部署

1. 确保仓库已启用 GitHub Pages
2. 推送到 `main` 分支会自动触发部署
3. 访问 `https://beyondqx.github.io` 查看博客

### 手动部署

```bash
npm run build
# 将 build 目录内容上传到 GitHub Pages
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **React Router** - 路由管理
- **Marked** - Markdown 解析
- **Highlight.js** - 代码高亮
- **Bootstrap 5** - CSS 框架
- **GitHub Actions** - CI/CD

## 📄 License

MIT

---

Made with ❤️ by beyondqx
