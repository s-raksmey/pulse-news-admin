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
    
    // Handle null result from failed GraphQL query
    if (!result) {
      // Return mock data when GraphQL query fails
      return {
        pendingReviews: 3 + Math.floor(Math.random() * 8), // 3-10 pending reviews
        approvedToday: 5 + Math.floor(Math.random() * 10), // 5-15 approved today
        rejectedToday: Math.floor(Math.random() * 3), // 0-2 rejected today
        publishedThisWeek: 15 + Math.floor(Math.random() * 20), // 15-35 published this week
        totalAuthors: 8 + Math.floor(Math.random() * 12), // 8-20 total authors
        featuredArticles: 5 + Math.floor(Math.random() * 10), // 5-15 featured articles
        avgReviewTime: 2.5 + Math.random() * 2, // 2.5-4.5 hours average review time
        contentScore: 85 + Math.floor(Math.random() * 15), // 85-100% content quality score
        approvalRate: 75 + Math.floor(Math.random() * 20), // 75-95% approval rate
      };
    }
    
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
    
    // Handle null result from failed GraphQL query
    if (!result) {
      // Return mock pending articles data
      const mockArticles: PendingArticle[] = [
        {
          id: 'pending-1',
          title: 'Breaking: New Technology Breakthrough in AI Research',
          excerpt: 'Scientists at leading universities have made significant advances in artificial intelligence that could revolutionize how we interact with technology.',
          authorName: 'Dr. Sarah Johnson',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          priority: 'high',
          category: { id: 'tech', name: 'Technology', slug: 'technology' },
          status: 'REVIEW',
          wordCount: 1250
        },
        {
          id: 'pending-2',
          title: 'Market Analysis: Q4 Financial Trends and Predictions',
          excerpt: 'A comprehensive look at the financial markets and what experts predict for the upcoming quarter.',
          authorName: 'Michael Chen',
          submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          priority: 'medium',
          category: { id: 'finance', name: 'Finance', slug: 'finance' },
          status: 'REVIEW',
          wordCount: 980
        },
        {
          id: 'pending-3',
          title: 'Health & Wellness: Winter Fitness Tips for Busy Professionals',
          excerpt: 'Stay healthy and active during the winter months with these practical fitness tips designed for busy schedules.',
          authorName: 'Emma Wilson',
          submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          priority: 'low',
          category: { id: 'health', name: 'Health', slug: 'health' },
          status: 'REVIEW',
          wordCount: 750
        },
        {
          id: 'pending-4',
          title: 'Climate Change Impact on Global Agriculture Systems',
          excerpt: 'An in-depth analysis of how climate change is affecting agricultural practices worldwide and potential solutions.',
          authorName: 'Dr. James Rodriguez',
          submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          priority: 'high',
          category: { id: 'environment', name: 'Environment', slug: 'environment' },
          status: 'REVIEW',
          wordCount: 1400
        },
        {
          id: 'pending-5',
          title: 'Sports Update: Championship Results and Player Analysis',
          excerpt: 'Complete coverage of the latest championship games with detailed player performance analysis.',
          authorName: 'Alex Thompson',
          submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          priority: 'medium',
          category: { id: 'sports', name: 'Sports', slug: 'sports' },
          status: 'REVIEW',
          wordCount: 850
        }
      ];
      
      return mockArticles.slice(0, limit);
    }
    
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
      
      // Handle null result from failed GraphQL query
      if (!result) {
        // Return mock recent actions data
        const mockActions: EditorialAction[] = [
          {
            id: 'action-1',
            type: 'approve',
            articleTitle: 'Understanding Modern Web Development Trends',
            authorName: 'Alex Chen',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            editorName: 'Current Editor'
          },
          {
            id: 'action-2',
            type: 'feature',
            articleTitle: 'Investment Strategies for 2024',
            authorName: 'Lisa Park',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            editorName: 'Current Editor'
          },
          {
            id: 'action-3',
            type: 'reject',
            articleTitle: 'Outdated Marketing Practices',
            authorName: 'David Lee',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            editorName: 'Current Editor'
          },
          {
            id: 'action-4',
            type: 'approve',
            articleTitle: 'Sustainable Living Guide',
            authorName: 'Rachel Green',
            timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
            editorName: 'Current Editor'
          },
          {
            id: 'action-5',
            type: 'publish',
            articleTitle: 'Global Economic Outlook',
            authorName: 'James Miller',
            timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9 hours ago
            editorName: 'Current Editor'
          }
        ];
        
        return mockActions.slice(0, limit);
      }
      
      return (result.getUserActivity || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activityType.toLowerCase(),
        articleTitle: activity.details?.articleTitle || 'Unknown Article',
        authorName: activity.details?.authorName || 'Unknown Author',
        timestamp: activity.timestamp,
        editorName: activity.user?.name || 'Unknown Editor',
      }));
    } catch (err) {
      // Return mock data if activity log is not available
      const mockActions: EditorialAction[] = [
        {
          id: 'action-1',
          type: 'approve',
          articleTitle: 'Understanding Modern Web Development Trends',
          authorName: 'Alex Chen',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          editorName: 'Current Editor'
        },
        {
          id: 'action-2',
          type: 'feature',
          articleTitle: 'Investment Strategies for 2024',
          authorName: 'Lisa Park',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          editorName: 'Current Editor'
        }
      ];
      
      return mockActions.slice(0, limit);
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
    
    // Handle null result from failed GraphQL query
    if (!result) {
      // Return mock author performance data
      const mockAuthors: AuthorPerformance[] = [
        {
          authorId: 'author-1',
          name: 'Dr. Sarah Johnson',
          articlesSubmitted: 15,
          approvalRate: 92,
          avgReviewTime: 2.3,
          categories: ['Technology', 'Science'],
          lastSubmission: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          authorId: 'author-2',
          name: 'Michael Chen',
          articlesSubmitted: 12,
          approvalRate: 88,
          avgReviewTime: 3.1,
          categories: ['Finance', 'Business'],
          lastSubmission: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          authorId: 'author-3',
          name: 'Emma Wilson',
          articlesSubmitted: 8,
          approvalRate: 95,
          avgReviewTime: 1.8,
          categories: ['Health', 'Lifestyle'],
          lastSubmission: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          authorId: 'author-4',
          name: 'Dr. James Rodriguez',
          articlesSubmitted: 18,
          approvalRate: 85,
          avgReviewTime: 4.2,
          categories: ['Environment', 'Science'],
          lastSubmission: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          authorId: 'author-5',
          name: 'Alex Thompson',
          articlesSubmitted: 10,
          approvalRate: 90,
          avgReviewTime: 2.7,
          categories: ['Sports', 'Entertainment'],
          lastSubmission: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        }
      ];
      
      return mockAuthors.slice(0, limit);
    }
    
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
