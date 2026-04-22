// src/hooks/useArticles.js
import { useState, useEffect, useCallback } from 'react';
import { fetchArticles, fetchArticle } from '../services/graphql';
import { discussionToArticle } from '../utils/articleUtils';
import { useAuth } from '../contexts/AuthContext';

export function useArticles(options = {}) {
  const { first = 20, publishedOnly = true } = options;
  const { token } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchArticles(token, first);
      const nodes = result.nodes || [];
      
      let processedArticles = nodes.map(discussionToArticle);
      
      // 过滤未发布文章
      if (publishedOnly) {
        processedArticles = processedArticles.filter(a => a.published);
      }
      
      setArticles(processedArticles);
      setTotalCount(result.totalCount || processedArticles.length);
    } catch (e) {
      setError(e.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [token, first, publishedOnly]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return {
    articles,
    loading,
    error,
    totalCount,
    refetch: loadArticles,
  };
}

export function useArticle(number) {
  const { token } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setError(null);
      
      try {
        const discussion = await fetchArticle(number, token);
        setArticle(discussionToArticle(discussion));
      } catch (e) {
        setError(e.message);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    
    if (number) {
      loadArticle();
    }
  }, [number, token]);

  return {
    article,
    loading,
    error,
  };
}

export default { useArticles, useArticle };