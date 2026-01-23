'use client';

import { useState, useEffect } from 'react';
import { useArticles, useCategories } from './useGraphQL';
import { UserService } from '@/services/user.gql';

interface Counts {
  articles: number;
  users: number;
  categories: number;
  media: number;
}

interface CountsResult {
  counts: Counts;
  loading: boolean;
  errors: {
    users?: string;
  };
}

export function useCounts(): CountsResult {
  const [counts, setCounts] = useState<Counts>({
    articles: 0,
    users: 0,
    categories: 0,
    media: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ users?: string }>({});
  
  const { getArticles } = useArticles();
  const { getCategories } = useCategories();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch articles count using GraphQL
        const articlesData = await getArticles({ take: 1000, skip: 0 });
        const articlesCount = articlesData?.articles?.length || 0;

        // Fetch users count using GraphQL stats (more efficient and reliable)
        let usersCount = 0;
        let userCountError: string | null = null;
        
        try {
          const userStats = await UserService.getUserStats();
          usersCount = userStats?.totalUsers || 0;
        } catch (userError) {
          console.warn('🔍 Frontend Debug - Failed to fetch users count via getUserStats:', userError);
          
          // Check if this is a permission error
          if (userError instanceof Error && userError.message.includes('Admin role required')) {
            userCountError = 'Admin access required for user statistics';
            console.warn('🔍 Frontend Debug - User lacks admin permissions for getUserStats');
            
            // Try basic stats as fallback for non-admin users
            try {
              const basicStats = await UserService.getBasicStats();
              usersCount = basicStats?.totalUsers || 0;
              userCountError = null; // Clear error if basic stats work
              console.log('🔍 Frontend Debug - Successfully fetched basic stats as fallback');
            } catch (basicStatsError) {
              console.warn('🔍 Frontend Debug - Basic stats fallback also failed:', basicStatsError);
              userCountError = 'Unable to fetch user statistics';
            }
          } else {
            // Fallback: Try to get a rough count from listUsers query
            try {
              const usersResult = await UserService.listUsers({ take: 1000, skip: 0 });
              usersCount = usersResult?.totalCount || 0;
            } catch (fallbackError) {
              console.warn('🔍 Frontend Debug - Fallback users count also failed:', fallbackError);
              
              if (fallbackError instanceof Error && fallbackError.message.includes('Admin role required')) {
                userCountError = 'Admin access required for user management';
              } else {
                userCountError = 'Unable to fetch user statistics';
              }
              // Keep default value of 0
            }
          }
        }

        // Fetch categories count using GraphQL
        const categoriesData = await getCategories();
        const categoriesCount = categoriesData?.categories?.length || 0;

        // Fetch media count using REST API (this one exists)
        let mediaCount = 0;
        try {
          const mediaResponse = await fetch('/api/media/upload');
          const mediaData = await mediaResponse.json();
          mediaCount = mediaData.success ? (mediaData.files?.length || 0) : 0;
        } catch (mediaError) {
          console.warn('Failed to fetch media count:', mediaError);
          // Keep default value of 0
        }

        setCounts({
          articles: articlesCount,
          users: usersCount,
          categories: categoriesCount,
          media: mediaCount,
        });
        
        setErrors({
          users: userCountError || undefined,
        });
      } catch (error) {
        console.error('Failed to fetch counts:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [getArticles, getCategories]);

  return { counts, loading, errors };
}
