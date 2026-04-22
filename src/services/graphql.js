// src/services/graphql.js
import { GITHUB_CONFIG } from '../config';

const GRAPHQL_ENDPOINT = GITHUB_CONFIG.GRAPHQL_API;

// 获取文章列表
export const GET_ARTICLES_QUERY = `
  query($owner: String!, $repo: String!, $first: Int!, $categoryId: ID) {
    repository(owner: $owner, name: $repo) {
      discussions(first: $first, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          number
          title
          body
          bodyHTML
          createdAt
          updatedAt
          author {
            login
            avatarUrl(size: 100)
          }
          labels(first: 10) {
            nodes {
              name
              color
            }
          }
          category {
            id
            name
          }
          comments(first: 100) {
            totalCount
            nodes {
              id
              body
              bodyHTML
              createdAt
              author {
                login
                avatarUrl(size: 50)
              }
              replyTo {
                id
              }
            }
          }
          reactions(first: 20) {
            totalCount
          }
        }
      }
      discussionCategory(name: "博客文章") {
        id
        name
      }
    }
  }
`;

// 获取单篇文章
export const GET_ARTICLE_QUERY = `
  query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      discussion(number: $number) {
        number
        title
        body
        bodyHTML
        createdAt
        updatedAt
        author {
          login
          avatarUrl(size: 100)
          url
        }
        labels(first: 10) {
          nodes {
            name
            color
          }
        }
        category {
          id
          name
        }
        comments(first: 100) {
          totalCount
          nodes {
            id
            body
            bodyHTML
            createdAt
            author {
              login
              avatarUrl(size: 50)
              url
            }
            replyTo {
              id
            }
          }
        }
      }
    }
  }
`;

// 获取分类列表
export const GET_CATEGORIES_QUERY = `
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 10) {
        nodes {
          id
          name
          slug
          description
        }
      }
    }
  }
`;

// GraphQL 请求函数
export async function graphqlQuery(query, variables, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}

// 获取文章列表
export async function fetchArticles(token = null, first = 20) {
  const result = await graphqlQuery(GET_ARTICLES_QUERY, {
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    first,
  }, token);
  
  return result.repository?.discussions || { nodes: [], totalCount: 0 };
}

// 获取单篇文章
export async function fetchArticle(number, token = null) {
  const result = await graphqlQuery(GET_ARTICLE_QUERY, {
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    number: parseInt(number),
  }, token);
  
  return result.repository?.discussion;
}

// 获取分类
export async function fetchCategories(token = null) {
  const result = await graphqlQuery(GET_CATEGORIES_QUERY, {
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
  }, token);
  
  return result.repository?.discussionCategories?.nodes || [];
}