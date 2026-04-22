# 博客系统完整配置指南

## 当前状态
- ✅ 代码已部署
- ✅ OAuth Client ID 已配置
- ⏳ Discussions 需启用
- ⏳ 标签需创建

---

## 步骤 1：启用 GitHub Discussions（必须）

### 操作步骤：

1. **打开设置页面**
   点击链接：https://github.com/beyondqx/beyondqx.github.io/settings
   （或手动进入：仓库 → Settings → General）

2. **找到 Features 区域**
   在页面中找到 "Features" 部分，大约在页面中间位置

3. **勾选 Discussions**
   找到 "Discussions" 选项，勾选复选框

4. **保存设置**
   页面会自动保存，或点击底部的 "Save changes" 按钮

5. **验证**
   仓库导航栏会出现 "Discussions" 标签

---

## 步骤 2：创建 Discussions 分类（必须）

启用 Discussions 后，必须创建「博客文章」分类：

### 操作步骤：

1. **进入 Discussions**
   点击仓库导航栏的 "Discussions"

2. **点击 Categories**
   在 Discussions 页面右上角找到 "Categories" 按钮

3. **创建新分类**
   点击 "New category"，填写：
   
   | 字段 | 内容 |
   |------|------|
   | Category name | 博客文章 |
   | Description | 博客文章存储分类 |
   | Emoji | 📝（可选）|

4. **保存**
   点击 "Create category"

---

## 步骤 3：创建标签（推荐）

标签用于区分文章状态和分类。

### 快速创建方法：

依次点击以下链接创建标签：

#### 标签 1：published（已发布）
- 链接：https://github.com/beyondqx/beyondqx.github.io/labels/new
- Label name：`published`
- Description：`已发布的文章`
- Color：点击颜色输入框，输入 `#28a745`（绿色）
- 点击 "Create label"

#### 标签 2：draft（草稿）
- 链接：https://github.com/beyondqx/beyondqx.github.io/labels/new
- Label name：`draft`
- Description：`草稿文章`
- Color：输入 `#f9a825`（黄色）
- 点击 "Create label"

#### 标签 3：tech（技术教程）
- 链接：https://github.com/beyondqx/beyondqx.github.io/labels/new
- Label name：`tech`
- Description：`技术教程分类`
- Color：输入 `#667eea`（紫色）
- 点击 "Create label"

#### 标签 4：life（生活随笔）
- 链接：https://github.com/beyondqx/beyondqx.github.io/labels/new
- Label name：`life`
- Description：`生活随笔分类`
- Color：输入 `#f5576c`（粉色）
- 点击 "Create label"

#### 标签 5：thoughts（思考笔记）
- 链接：https://github.com/beyondqx/beyondqx.github.io/labels/new
- Label name：`thoughts`
- Description：`思考笔记分类`
- Color：输入 `#4facfe`（蓝色）
- 点击 "Create label"

---

## 步骤 4：发表第一篇文章

完成上述配置后：

1. 访问 https://beyondqx.github.io/#/login
2. 点击 "使用 GitHub 登录"
3. 授权后进入管理后台 /admin
4. 点击 "新建文章"
5. 编写并发布你的第一篇文章！

---

## 快速链接汇总

| 操作 | 链接 |
|------|------|
| 仓库设置 | https://github.com/beyondqx/beyondqx.github.io/settings |
| Discussions | https://github.com/beyondqx/beyondqx.github.io/discussions |
| 创建标签 | https://github.com/beyondqx/beyondqx.github.io/labels/new |
| 博客首页 | https://beyondqx.github.io |
| 登录页面 | https://beyondqx.github.io/#/login |
| 管理后台 | https://beyondqx.github.io/#/admin |

---

## 常见问题

### Q: Discussions 选项找不到？
A: 你需要是仓库的 Owner 才能看到 Discussions 设置选项。

### Q: 登录后显示权限不足？
A: 只有仓库 Owner (beyondqx) 才能管理文章，其他用户只能评论。

### Q: 文章列表显示错误？
A: 确保 Discussions 已启用，且创建了「博客文章」分类。

---

配置完成后，你就可以：
- 📝 在网页端直接创建、编辑、删除文章
- 💬 评论互动
- 🌙 深色模式阅读
- 📱 移动端完美适配