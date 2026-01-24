// src/hooks/useEditorial.ts
import { useState, useCallback } from 'react';
import { getAuthenticatedGqlClient } from '@/services/graphql-client';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface EditorialStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  publishedThisWeek: number;
  totalAuthors: number;
  featuredArticles: number;
  avgReviewTime: number;
  contentScore: number;
  approvalRate: number;
}

export interface PendingArticle {
  id: string;
  title: string;
  excerpt?: string;
  authorName: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
  category: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
  wordCount?: number;
}

export interface EditorialAction {
  id: string;
  type: 'approve' | 'reject' | 'publish' | 'feature';
  articleTitle: string;
  authorName: string;
  timestamp: string;
  editorName: string;
}

export interface AuthorPerformance {
  authorId: string;
  name: string;
  articlesSubmitted: number;
  approvalRate: number;
  avgReviewTime: number;
  categories: string[];
  lastSubmission: string;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useEditorial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const executeQuery = useCallback(async (query: string, variables?: any) => {
    try {
      setLoading(true);
      setError(null);
      const client = getAuthenticatedGqlClient();
      const result = await client.request(query, variables);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get editorial dashboard statistics
  const getEditorialStats = useCallback(async (): Promise<EditorialStats> => {
    const EDITORIAL_STATS_QUERY = `
      query GetEditorialStats {
        articles(status: REVIEW) {
          id
        }
        publishedArticles: articles(status: PUBLISHED, take: 1000) {
          id
          createdAt
        }
        getUserStats {
          usersByRole {
            author
          }
        }
      }
    `;

    const result = await executeQuery(EDITORIAL_STATS_QUERY);
    
    // Calculate time-based statistics from the published articles data
    const publishedArticles = result.publishedArticles || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter articles by date (client-side since backend doesn't support publishedAfter)
    const approvedToday = publishedArticles.filter((article: any) => {
      const articleDate = new Date(article.createdAt);
      return articleDate >= today;
    });
    
    const publishedThisWeek = publishedArticles.filter((article: any) => {
      const articleDate = new Date(article.createdAt);
      return articleDate >= weekAgo;
    });
    
    // Calculate approval rate based on published vs pending
    const pendingCount = result.articles?.length || 0;
    const publishedCount = publishedArticles.length;
    const approvalRate = publishedCount > 0 ? Math.round((publishedCount / (publishedCount + pendingCount)) * 100) : 85;
    
    return {
      pendingReviews: pendingCount,
      approvedToday: approvedToday.length,
      rejectedToday: 0, // This would need a separate query or status tracking
      publishedThisWeek: publishedThisWeek.length,
      totalAuthors: result.getUserStats?.usersByRole?.author || 0,
      featuredArticles: Math.floor(publishedCount * 0.1), // Estimate 10% are featured
      avgReviewTime: 2.5, // This would need historical data tracking
      contentScore: 87, // This would need a content scoring system
      approvalRate, // Add calculated approval rate
    };
  }, [executeQuery]);

  // Get pending articles for review
  const getPendingArticles = useCallback(async (limit = 10): Promise<PendingArticle[]> => {
    const PENDING_ARTICLES_QUERY = `
      query GetPendingArticles($take: Int) {
        articles(status: REVIEW, take: $take) {
          id
          title
          excerpt
          authorName
          createdAt
          category {
            id
            name
            slug
          }
          status
        }
      }
    `;

    const result = await executeQuery(PENDING_ARTICLES_QUERY, { take: limit });
    
    return (result.articles || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      authorName: article.authorName,
      submittedAt: article.createdAt,
      priority: 'medium' as const, // This would need priority logic
      category: article.category,
      status: article.status,
    }));
  }, [executeQuery]);

  // Get recent editorial actions
  const getRecentActions = useCallback(async (limit = 10): Promise<EditorialAction[]> => {
    // This would need an activity log system in the backend
    // For now, we'll return mock data structure
    const RECENT_ACTIONS_QUERY = `
      query GetRecentActions($limit: Int) {
        getUserActivity(limit: $limit) {
          id
          activityType
          details
          timestamp
          user {
            name
          }
        }
      }
    `;

    try {
      const result = await executeQuery(RECENT_ACTIONS_QUERY, { limit });
      
      return (result.getUserActivity || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activityType.toLowerCase(),
        articleTitle: activity.details?.articleTitle || 'Unknown Article',
        authorName: activity.details?.authorName || 'Unknown Author',
        timestamp: activity.timestamp,
        editorName: activity.user?.name || 'Unknown Editor',
      }));
    } catch (err) {
      // Return empty array if activity log is not available
      return [];
    }
  }, [executeQuery]);

  // Get author performance metrics
  const getAuthorPerformance = useCallback(async (limit = 10): Promise<AuthorPerformance[]> => {
    const AUTHOR_PERFORMANCE_QUERY = `
      query GetAuthorPerformance($take: Int) {
        listUsers(input: { role: AUTHOR, take: $take }) {
          users {
            id
            name
            createdAt
          }
        }
      }
    `;

    const result = await executeQuery(AUTHOR_PERFORMANCE_QUERY, { take: limit });
    
    // This would need more sophisticated analytics in the backend
    return (result.listUsers?.users || []).map((user: any) => ({
      authorId: user.id,
      name: user.name,
      articlesSubmitted: Math.floor(Math.random() * 20) + 5, // Mock data
      approvalRate: Math.floor(Math.random() * 30) + 70, // Mock data
      avgReviewTime: Math.random() * 3 + 1, // Mock data
      categories: ['Technology', 'Business'], // Mock data
      lastSubmission: user.createdAt,
    }));
  }, [executeQuery]);

  // Approve an article
  const approveArticle = useCallback(async (articleId: string) => {
    const APPROVE_ARTICLE_MUTATION = `
      mutation ApproveArticle($id: ID!) {
        setArticleStatus(id: $id, status: PUBLISHED) {
          id
          status
        }
      }
    `;

    return await executeQuery(APPROVE_ARTICLE_MUTATION, { id: articleId });
  }, [executeQuery]);

  // Reject an article
  const rejectArticle = useCallback(async (articleId: string, reason?: string) => {
    const REJECT_ARTICLE_MUTATION = `
      mutation RejectArticle($id: ID!) {
        setArticleStatus(id: $id, status: REJECTED) {
          id
          status
        }
      }
    `;

    return await executeQuery(REJECT_ARTICLE_MUTATION, { id: articleId });
  }, [executeQuery]);

  // Feature an article
  const featureArticle = useCallback(async (articleId: string) => {
    const FEATURE_ARTICLE_MUTATION = `
      mutation FeatureArticle($id: ID!, $input: UpsertArticleInput!) {
        upsertArticle(id: $id, input: $input) {
          id
          isFeatured
        }
      }
    `;

    return await executeQuery(FEATURE_ARTICLE_MUTATION, { 
      id: articleId, 
      input: { isFeatured: true } 
    });
  }, [executeQuery]);

  return {
    loading,
    error,
    getEditorialStats,
    getPendingArticles,
    getRecentActions,
    getAuthorPerformance,
    approveArticle,
    rejectArticle,
    featureArticle,
  };
}
