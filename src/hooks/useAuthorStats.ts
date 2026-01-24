// src/hooks/useAuthorStats.ts
import { useState, useCallback } from 'react';
import { getAuthenticatedGqlClient } from '@/services/graphql-client';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AuthorStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  inReviewArticles: number;
  rejectedArticles: number;
  totalViews: number;
  monthlyGoal: number;
  monthlyProgress: number;
  approvalRate: number;
  avgViewsPerArticle: number;
}

export interface AuthorArticle {
  id: string;
  title: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  views?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  excerpt?: string;
  feedback?: string;
}

export interface WritingGoal {
  id: string;
  target: number;
  current: number;
  period: 'weekly' | 'monthly' | 'yearly';
  deadline: string;
}

export interface AuthorInsights {
  topPerformingArticles: AuthorArticle[];
  recentActivity: {
    articlesThisWeek: number;
    viewsThisWeek: number;
    approvalRate: number;
  };
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  writingStreak: {
    current: number;
    longest: number;
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAuthorStats() {
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

  // Get author's personal statistics
  const getAuthorStats = useCallback(async (): Promise<AuthorStats> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const AUTHOR_STATS_QUERY = `
      query GetAuthorStats {
        # Get all articles by current user
        allArticles: articles(take: 1000) {
          id
          status
          viewCount
          authorName
          publishedAt
          createdAt
        }
        
        # Get published articles for view count
        publishedArticles: articles(status: PUBLISHED, take: 1000) {
          id
          viewCount
          authorName
        }
        
        # Get draft articles
        draftArticles: articles(status: DRAFT, take: 1000) {
          id
          authorName
        }
        
        # Get pending articles
        pendingArticles: articles(status: PENDING, take: 1000) {
          id
          authorName
        }
      }
    `;

    const result = await executeQuery(AUTHOR_STATS_QUERY);
    
    // Filter articles by current user (since we don't have user-specific filtering in the query)
    const userArticles = (result.allArticles || []).filter((article: any) => 
      article.authorName === user.name
    );
    
    const publishedByUser = (result.publishedArticles || []).filter((article: any) => 
      article.authorName === user.name
    );
    
    const draftsByUser = (result.draftArticles || []).filter((article: any) => 
      article.authorName === user.name
    );
    
    const pendingByUser = (result.pendingArticles || []).filter((article: any) => 
      article.authorName === user.name
    );

    // Calculate total views
    const totalViews = publishedByUser.reduce((sum: number, article: any) => 
      sum + (article.viewCount || 0), 0
    );

    // Calculate approval rate
    const totalSubmitted = userArticles.filter((a: any) => 
      a.status !== 'DRAFT'
    ).length;
    const approved = publishedByUser.length;
    const approvalRate = totalSubmitted > 0 ? (approved / totalSubmitted) * 100 : 0;

    // Calculate monthly progress (articles published this month)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyProgress = publishedByUser.filter((article: any) => 
      new Date(article.publishedAt) >= thisMonth
    ).length;

    return {
      totalArticles: userArticles.length,
      publishedArticles: publishedByUser.length,
      draftArticles: draftsByUser.length,
      inReviewArticles: pendingByUser.length,
      rejectedArticles: userArticles.filter((a: any) => a.status === 'REJECTED').length,
      totalViews,
      monthlyGoal: 8, // This would come from user preferences
      monthlyProgress,
      approvalRate: Math.round(approvalRate),
      avgViewsPerArticle: publishedByUser.length > 0 ? Math.round(totalViews / publishedByUser.length) : 0,
    };
  }, [executeQuery, user]);

  // Get author's articles with details
  const getAuthorArticles = useCallback(async (limit = 20): Promise<AuthorArticle[]> => {
    if (!user?.name) {
      throw new Error('User not authenticated');
    }

    const AUTHOR_ARTICLES_QUERY = `
      query GetAuthorArticles($take: Int) {
        articles(take: $take) {
          id
          title
          status
          viewCount
          publishedAt
          createdAt
          updatedAt
          authorName
          excerpt
          category {
            id
            name
            slug
          }
        }
      }
    `;

    const result = await executeQuery(AUTHOR_ARTICLES_QUERY, { take: limit * 2 }); // Get more to filter
    
    // Filter by current user
    const userArticles = (result.articles || []).filter((article: any) => 
      article.authorName === user.name
    ).slice(0, limit);

    return userArticles.map((article: any) => ({
      id: article.id,
      title: article.title,
      status: article.status,
      views: article.viewCount,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      category: article.category,
      excerpt: article.excerpt,
    }));
  }, [executeQuery, user]);

  // Get author insights and analytics
  const getAuthorInsights = useCallback(async (): Promise<AuthorInsights> => {
    if (!user?.name) {
      throw new Error('User not authenticated');
    }

    const articles = await getAuthorArticles(50); // Get more for analysis
    
    // Top performing articles (by views)
    const topPerformingArticles = articles
      .filter(article => article.status === 'PUBLISHED' && article.views)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    // Recent activity (this week)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const articlesThisWeek = articles.filter(article => 
      new Date(article.createdAt) >= oneWeekAgo
    ).length;
    
    const publishedThisWeek = articles.filter(article => 
      article.status === 'PUBLISHED' && 
      article.publishedAt && 
      new Date(article.publishedAt) >= oneWeekAgo
    );
    
    const viewsThisWeek = publishedThisWeek.reduce((sum, article) => 
      sum + (article.views || 0), 0
    );

    // Category distribution
    const categoryCount: { [key: string]: number } = {};
    articles.forEach(article => {
      const categoryName = article.category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / articles.length) * 100)
    }));

    // Writing streak (simplified - would need more sophisticated tracking)
    const writingStreak = {
      current: articlesThisWeek > 0 ? 7 : 0, // Simplified
      longest: 14 // This would need historical tracking
    };

    const stats = await getAuthorStats();

    return {
      topPerformingArticles,
      recentActivity: {
        articlesThisWeek,
        viewsThisWeek,
        approvalRate: stats.approvalRate
      },
      categoryDistribution,
      writingStreak
    };
  }, [getAuthorArticles, getAuthorStats, user]);

  // Get writing goals
  const getWritingGoals = useCallback(async (): Promise<WritingGoal[]> => {
    // This would typically come from a user preferences/goals system
    // For now, return a default monthly goal
    const stats = await getAuthorStats();
    
    return [
      {
        id: 'monthly-articles',
        target: stats.monthlyGoal,
        current: stats.monthlyProgress,
        period: 'monthly',
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      }
    ];
  }, [getAuthorStats]);

  // Update writing goal
  const updateWritingGoal = useCallback(async (goalId: string, target: number) => {
    // This would update user preferences in the backend
    // For now, just return success
    return { success: true, message: 'Goal updated successfully' };
  }, []);

  return {
    loading,
    error,
    getAuthorStats,
    getAuthorArticles,
    getAuthorInsights,
    getWritingGoals,
    updateWritingGoal,
  };
}

