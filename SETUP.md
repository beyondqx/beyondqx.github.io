# 配置指南

## 步骤 1：启用 GitHub Discussions

1. 打开 https://github.com/beyondqx/beyondqx.github.io/settings
2. 找到 **Features** 区域
3. 勾选 **Discussions**
4. 保存设置

## 步骤 2：创建分类

1. 进入 https://github.com/beyondqx/beyondqx.github.io/discussions
2. 点击 **Categories** → **New category**
3. 填写：
   - Name: `博客文章`
   - Description: `博客文章存储分类`
4. 点击 **Create category**

## 步骤 3：配置 OAuth

1. 打开 https://github.com/settings/developers
2. 创建新的 OAuth App：
   - **Homepage URL**: `https://beyondqx.github.io`
   - **Authorization callback URL**: `https://beyondqx.github.io`
3. 复制 **Client ID**
4. 复制 `.env.example` 为 `.env`
5. 填入 Client ID：
   ```
   REACT_APP_GITHUB_CLIENT_ID=你的 Client ID
   ```

## 步骤 4：本地开发

```bash
# 安装依赖（如未安装）
npm install

# 启动开发服务器
npm start
```

访问 http://localhost:3000

## 步骤 5：部署

```bash
# 构建
npm run build

# 部署到 GitHub Pages
npm run deploy
```

## 快速链接

| 功能 | 链接 |
|------|------|
| 博客首页 | https://beyondqx.github.io |
| 登录 | https://beyondqx.github.io/#/login |
| 管理后台 | https://beyondqx.github.io/#/admin |
| Discussions | https://github.com/beyondqx/beyondqx.github.io/discussions |
