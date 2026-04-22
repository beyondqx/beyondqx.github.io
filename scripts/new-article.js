#!/usr/bin/env node

/**
 * 新建文章脚本
 * 用法：npm run new-article -- "文章标题"
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
const title = args[0];

if (!title) {
  console.error('❌ 请提供文章标题');
  console.log('用法：npm run new-article -- "文章标题"');
  process.exit(1);
}

// 生成 slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\\u4e00-\\u9fa5\\s-]/g, '')
    .replace(/[\\s-]+/g, '-')
    .trim();
};

// 生成唯一 ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 创建文章模板
const createArticleTemplate = (title) => {
  const slug = generateSlug(title);
  const id = generateId();
  const date = new Date().toISOString();
  
  const article = {
    id,
    slug,
    title,
    excerpt: '请输入文章摘要...',
    content: `# ${title}

## 前言

在这里写文章的开头...

## 正文

### 第一部分

详细内容...

### 第二部分

更多内容...

## 总结

文章总结...

> 提示：支持 Markdown 语法
`,
    category: '未分类',
    tags: [],
    coverImage: null,
    published: false,
    createdAt: date,
    updatedAt: date,
    readTime: 1
  };

  return { article, slug };
};

// 主函数
const main = () => {
  const { article, slug } = createArticleTemplate(title);
  
  // 读取现有数据
  const dataPath = path.join(__dirname, '..', 'src', 'utils', 'data.js');
  let dataContent = fs.readFileSync(dataPath, 'utf-8');
  
  // 解析 initialData（简单方式：使用正则提取）
  const initialDataMatch = dataContent.match(/export const initialData = ([\\s\\S]+?);\\n\\/\\*\\*\\n \\* 获取所有文章/);
  if (!initialDataMatch) {
    console.error('❌ 无法解析数据文件');
    process.exit(1);
  }

  // 由于是复杂对象，我们采用简单追加方式
  // 找到 articles 数组的开始位置
  const articlesStartIndex = dataContent.indexOf('articles: [');
  const articlesContentStart = articlesStartIndex + 11; // 'articles: ['.length
  
  // 找到 articles 数组的结束位置（第一个 ]）
  let bracketCount = 1;
  let articlesEndIndex = articlesContentStart;
  while (bracketCount > 0 && articlesEndIndex < dataContent.length) {
    if (dataContent[articlesEndIndex] === '[') bracketCount++;
    if (dataContent[articlesEndIndex] === ']') bracketCount--;
    articlesEndIndex++;
  }
  
  // 构建新的文章对象字符串
  const newArticleStr = `
    {
      id: '${article.id}',
      slug: '${slug}',
      title: '${article.title.replace(/'/g, "\\'")}',
      excerpt: '${article.excerpt.replace(/'/g, "\\'")}',
      content: \`${article.content.replace(/`/g, '\\`')}\`,
      category: '${article.category}',
      tags: ${JSON.stringify(article.tags)},
      coverImage: ${article.coverImage},
      published: ${article.published},
      createdAt: '${article.createdAt}',
      updatedAt: '${article.updatedAt}',
      readTime: ${article.readTime}
    },`;

  // 插入到 articles 数组开头
  const newDataContent = 
    dataContent.substring(0, articlesContentStart) + 
    newArticleStr + 
    dataContent.substring(articlesContentStart);

  // 写回文件
  fs.writeFileSync(dataPath, newDataContent, 'utf-8');

  // 创建 Markdown 文件（可选，用于备份）
  const markdownPath = path.join(__dirname, '..', 'articles', `${slug}.md`);
  if (!fs.existsSync(path.dirname(markdownPath))) {
    fs.mkdirSync(path.dirname(markdownPath), { recursive: true });
  }
  fs.writeFileSync(markdownPath, article.content, 'utf-8');

  console.log('✅ 文章创建成功！');
  console.log(`   标题：${article.title}`);
  console.log(`   Slug: ${slug}`);
  console.log(`   文件：src/utils/data.js`);
  console.log(`   Markdown 备份：articles/${slug}.md`);
  console.log('\\n📝 下一步：');
  console.log('   1. 编辑 src/utils/data.js 中的文章信息');
  console.log('   2. 将 published 设置为 true 以发布文章');
  console.log('   3. 运行 npm start 预览效果');
};

main();
