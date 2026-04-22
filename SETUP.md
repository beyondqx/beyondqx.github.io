# 博客系统配置指南

## 配置步骤

### 步骤 1：启用 GitHub Discussions

1. 打开 https://github.com/beyondqx/beyondqx.github.io/settings
2. 滚动到 **Features** 部分
3. 勾选 **Discussions** 复选框
4. 点击 **Set up discussions**
5. 创建一个分类，命名为 **「博客文章」**（Category name: 博客文章）

### 步骤 2：创建标签

进入 https://github.com/beyondqx/beyondqx.github.io/labels，创建以下标签：

| 标签名称 | 颜色 | 用途 |
|---------|------|-----|
| published | #28a745 | 已发布文章 |
| draft | #f9a825 | 草稿文章 |
| tech | #667eea | 技术教程 |
| life | #f5576c | 生活随笔 |
| thoughts | #4facfe | 思考笔记 |

### 步骤 3：创建 GitHub OAuth App（必须手动）

1. 打开 https://github.com/settings/applications/new
2. 填写以下信息：
   - **Application name**: `beyondqx-blog`
   - **Homepage URL**: `https://beyondqx.github.io`
   - **Authorization callback URL**: `https://beyondqx.github.io/#/login/callback`
3. 点击 **Register application**
4. 复制 **Client ID**（类似：`Iv1.xxxxxxxx`）
5. 如果需要，可以生成 **Client Secret**（可选）

### 步骤 4：配置环境变量

在项目根目录创建 `.env` 文件：

```bash
REACT_APP_GITHUB_CLIENT_ID=你的Client_ID
```

### 步骤 5：重新构建和部署

```bash
npm run build
git add .env
git commit -m "配置 OAuth Client ID"
git push
```

---

## 快速链接

- [仓库设置](https://github.com/beyondqx/beyondqx.github.io/settings)
- [Discussions 页面](https://github.com/beyondqx/beyondqx.github.io/discussions)
- [标签管理](https://github.com/beyondqx/beyondqx.github.io/labels/new)
- [创建 OAuth App](https://github.com/settings/applications/new)

---

配置完成后，访问 https://beyondqx.github.io 即可开始使用！