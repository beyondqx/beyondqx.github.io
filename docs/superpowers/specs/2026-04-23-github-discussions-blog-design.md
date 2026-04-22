# 博客系统改造设计文档

## 项目概述

将现有的纯静态 React 博客改造为基于 GitHub Discussions 的全栈博客平台，实现文章在线管理、用户系统、评论系统和访问统计，全部部署在 GitHub 生态内。

## 设计目标

- **文章管理**：网页端直接创建、编辑、删除文章
- **用户系统**：GitHub OAuth 登录，区分博主和访客权限
- **评论系统**：基于 Discussions 的评论和回复功能
- **访问统计**：Google Analytics + GitHub Insights
- **零成本**：全部基于 GitHub，无需服务器和数据库费用

---

## 一、整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Pages                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  React 前端 │  │  管理后台   │  │  文章列表   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              GitHub API (REST/GraphQL)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Discussions                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  文章帖子   │  │  评论回复   │  │  分类标签   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub OAuth                                │
│                   (用户登录认证)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流向

1. **读取文章**：前端 → GitHub GraphQL API → Discussions → 渲染页面
2. **创建文章**：管理后台 → GitHub REST API → 创建 Discussion → 返回结果
3. **评论**：文章页 → GitHub API → Discussion Comments → 显示评论
4. **认证**：用户点击登录 → GitHub OAuth → 获取 Token → 存储前端

---

## 二、数据模型

### GitHub Discussion 作为文章数据

每个博客文章对应一个 Discussion：

| 字段 | Discussion 映射 | 说明 |
|------|-----------------|------|
| id | discussion.number | 文章唯一标识 |
| title | discussion.title | 文章标题 |
| content | discussion.body | Markdown 正文 |
| author | discussion.author.login | 作者 GitHub 用户名 |
| authorAvatar | discussion.author.avatarUrl | 作者头像 |
| createdAt | discussion.createdAt | 创建时间 |
| updatedAt | discussion.lastEditedAt | 更新时间 |
| category | discussion.category.name | Discussion 分类 |
| tags | discussion.labels.nodes[].name | 标签数组 |
| published | labels 包含 "published" | 发布状态 |
| comments | discussion.comments | 评论列表 |

### 标签系统

预定义标签：

- `published` - 已发布文章
- `draft` - 草稿文章
- `tech` - 技术教程
- `life` - 生活随笔
- `thoughts` - 思考笔记

### Discussion 分类

在 GitHub 仓库启用 Discussions 后，创建以下分类：

1. **博客文章** - 存储所有博客文章
2. **问题反馈** - 用户反馈和建议（可选）

---

## 三、功能模块

### 3.1 文章管理模块

#### 功能列表

| 功能 | API | 权限 |
|------|-----|------|
| 获取文章列表 | GraphQL query | 公开 |
| 获取单篇文章 | GraphQL query | 公开 |
| 创建文章 | REST POST /discussions | 需登录 + 写权限 |
| 编辑文章 | REST PATCH /discussions/{id} | 需登录 + 作者/管理员 |
| 删除文章 | REST DELETE /discussions/{id} | 需登录 + 管理员 |
| 发布/草稿切换 | REST PUT /labels | 需登录 + 作者/管理员 |

#### 管理后台界面

- 文章列表表格（标题、分类、状态、时间、操作）
- 新建文章按钮
- Markdown 编辑器（实时预览）
- 草稿/发布状态切换
- 分类和标签选择

### 3.2 用户系统模块

#### OAuth 认证流程

```
1. 用户点击「GitHub 登录」
2. 跳转: https://github.com/login/oauth/authorize
   参数: client_id, redirect_uri, scope=public_repo,write:discussion
3. 用户授权后，GitHub 重定向回前端并附带 code
4. 前端用 code 请求后端(或直接在前端)获取 access_token
   POST https://github.com/login/oauth/access_token
5. Token 存储到 localStorage
6. 前端维护 AuthContext，全局共享登录状态
```

#### 权限控制

- **博主（仓库 Owner/Collaborator）**：可以管理所有文章
- **访客（已登录）**：可以评论，不能管理文章
- **未登录用户**：只能阅读，不能评论

权限判断逻辑：
```javascript
const isOwner = (user, repoOwner) => user.login === repoOwner;
const canManage = isOwner(user, repoOwner) || isCollaborator(user);
```

### 3.3 评论系统模块

#### 评论数据结构

```javascript
{
  id: comment.id,
  author: comment.author.login,
  authorAvatar: comment.author.avatarUrl,
  body: comment.body,        // Markdown
  createdAt: comment.createdAt,
  replies: comment.replies   // 嵌套回复
}
```

#### 评论功能

- 评论输入框（Markdown 支持）
- 评论列表（支持嵌套）
- 回复功能
- 需要 GitHub 登录才能评论

### 3.4 访问统计模块

#### 统计来源

1. **Google Analytics** - 页面 PV/UV、用户行为、地域分布
2. **GitHub Insights** - Discussion 浏览量、仓库访问统计
3. **前端统计组件** - 热门文章排行（基于 GitHub API reactionCount）

#### 统计页面（管理后台）

- 总访问量趋势图
- 热门文章排行
- 用户地域分布
- 评论活跃度

---

## 四、前端改造

### 新增页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | /login | GitHub OAuth 登录入口 |
| 用户主页 | /user/:username | 用户发表的文章列表 |

### 改造页面

| 页面 | 路径 | 改造内容 |
|------|------|---------|
| 管理后台 | /admin | 真正的管理功能，不再是展示页 |
| 文章详情 | /article/:id | 添加评论区 |
| 首页 | / | 数据从 GitHub API 获取 |

### 新增组件

```
src/
├── services/
│   ├── githubApi.js        # GitHub API 封装
│   ├── auth.js             # OAuth 认证
│   └── graphql.js          # GraphQL 查询
├── contexts/
│   └── AuthContext.js      # 全局登录状态
├── components/
│   ├── LoginButton.js      # 登录/用户头像按钮
│   ├── CommentSection.js   # 评论列表+输入框
│   ├── MarkdownEditor.js   # Markdown 编辑器
│   ├── ArticleForm.js      # 新建/编辑文章表单
│   ├── StatsWidget.js      # 统计数据展示
├── pages/
│   ├── LoginPage.js        # 登录页面
│   ├── UserPage.js         # 用户主页
│   ├── AdminPage.js        # 改造后的管理后台
```

### 状态管理

使用 React Context + Hooks：

```javascript
// AuthContext
const AuthContext = createContext({
  user: null,           // GitHub 用户信息
  token: null,          // OAuth Token
  isLoggedIn: false,    // 登录状态
  isOwner: false,       // 是否博主
  login: () => {},      // 登录方法
  logout: () => {}      // 登出方法
});
```

---

## 五、API 设计

### GraphQL 查询

#### 获取文章列表

```graphql
query GetArticles($owner: String!, $repo: String!, $first: Int!) {
  repository(owner: $owner, name: $repo) {
    discussions(first: $first, categoryId: "博客文章分类ID") {
      nodes {
        number
        title
        body
        bodyHTML
        createdAt
        updatedAt
        author {
          login
          avatarUrl
        }
        labels(first: 10) {
          nodes { name color }
        }
        category { name }
        comments(first: 50) {
          totalCount
          nodes {
            id
            body
            createdAt
            author { login avatarUrl }
            replies(first: 10) {
              nodes {
                id
                body
                author { login }
              }
            }
          }
        }
      }
    }
  }
}
```

#### 获取单篇文章

```graphql
query GetArticle($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    discussion(number: $number) {
      number
      title
      body
      bodyHTML
      createdAt
      author { login avatarUrl }
      labels(first: 10) { nodes { name } }
      comments(first: 100) {
        nodes {
          id
          body
          createdAt
          author { login avatarUrl }
        }
      }
    }
  }
}
```

### REST API 操作

#### 创建文章

```http
POST /repos/{owner}/{repo}/discussions
Authorization: token {access_token}

{
  "title": "文章标题",
  "body": "Markdown 内容",
  "category_id": "分类ID",
  "labels": ["tech", "published"]
}
```

#### 编辑文章

```http
PATCH /repos/{owner}/{repo}/discussions/{discussion_number}
Authorization: token {access_token}

{
  "title": "新标题",
  "body": "新内容"
}
```

#### 删除文章

```http
DELETE /repos/{owner}/{repo}/discussions/{discussion_number}
Authorization: token {access_token}
```

#### 添加评论

```http
POST /repos/{owner}/{repo}/discussions/{discussion_number}/comments
Authorization: token {access_token}

{
  "body": "评论内容"
}
```

---

## 六、部署配置

### GitHub Pages

保持现有部署方式：
- GitHub Actions 自动构建
- 构建产物部署到 GitHub Pages

### GitHub Discussions 启用

步骤：
1. 进入仓库 Settings → Features → Discussions → Enable
2. 创建分类「博客文章」
3. 获取分类 ID（通过 GraphQL API）

### GitHub OAuth App 配置

步骤：
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. 配置：
   - Application name: `beyondqx-blog`
   - Homepage URL: `https://beyondqx.github.io`
   - Authorization callback URL: `https://beyondqx.github.io/login/callback`
3. 获取 Client ID 和 Client Secret
4. 配置到前端环境变量

### 环境变量

```bash
# .env 文件
REACT_APP_GITHUB_CLIENT_ID=your_client_id
REACT_APP_GITHUB_REPO=beyondqx/beyondqx.github.io
REACT_APP_GITHUB_OWNER=beyondqx
REACT_APP_DISCUSSION_CATEGORY_ID=博客文章分类ID
REACT_APP_GOOGLE_ANALYTICS_ID=GA跟踪ID(可选)
```

---

## 七、安全考虑

### Token 安全

- Token 存储在 localStorage，仅用于 API 请求
- 不在 URL 或日志中暴露 Token
- 提供「登出」功能清除 Token

### CORS 处理

GitHub API 支持 CORS，前端可直接调用
OAuth Token 交换需要考虑：
- 方案 A：纯前端交换（Token 在 URL 中短暂暴露）
- 方案 B：使用 GitHub 的官方 OAuth 流程（推荐）

### 权限验证

- 每次管理操作验证用户权限
- 前端显示权限状态（博主/访客）
- 敏感操作需二次确认

---

## 八、错误处理

### API 错误

```javascript
try {
  const result = await githubApi.createDiscussion(data);
} catch (error) {
  if (error.status === 401) {
    // Token 失效，提示重新登录
  } else if (error.status === 403) {
    // 无权限，提示权限不足
  } else if (error.status === 404) {
    // Discussion 不存在
  } else {
    // 其他错误
  }
}
```

### 网络错误

- 显示加载状态
- 错误时显示友好提示
- 提供重试按钮

### 评论失败处理

- 检查登录状态
- 内容验证（非空）
- 提示失败原因

---

## 九、测试策略

### 单元测试

- API 服务层测试
- AuthContext 测试
- 数据转换函数测试

### 集成测试

- OAuth 登录流程测试
- 文章 CRUD 流程测试
- 评论流程测试

### E2E 测试（可选）

- Cypress 测试完整用户流程

---

## 十、实施计划概要

### 阶段一：基础改造（优先级最高）
- 启用 GitHub Discussions
- 配置 OAuth App
- 实现 GitHub API 服务层
- 改造首页数据获取方式

### 阶段二：文章管理
- 实现管理后台 CRUD
- Markdown 编辑器
- 权限控制

### 阶段三：评论系统
- 评论组件
- 评论 API 集成
- 回复功能

### 阶段四：用户系统
- 登录页面
- 用户主页
- 统计数据

### 阶段五：优化完善
- 性能优化
- SEO 优化
- 错误处理完善

---

## 附录：技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 |
| 路由 | React Router 6 |
| API 通信 | GraphQL (Apollo Client) + REST |
| 认证 | GitHub OAuth |
| 数据存储 | GitHub Discussions |
| Markdown | marked + highlight.js |
| 部署 | GitHub Pages + GitHub Actions |
| 统计 | Google Analytics |

---

设计完成日期：2026-04-23
设计师：Qwen Code