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

export function useCounts() {
  const [counts, setCounts] = useState<Counts>({
    articles: 0,
    users: 0,
    categories: 0,
    media: 0,
  });
  const [loading, setLoading] = useState(true);
  
  const { getArticles } = useArticles();
  const { getCategories } = useCategories();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch articles count using GraphQL
        const articlesData = await getArticles({ take: 1000, skip: 0 });
        const articlesCount = articlesData?.articles?.length || 0;

        // Fetch users count using GraphQL
        let usersCount = 0;
        try {
          const usersData = await UserService.listUsers({ 
            search: '', 
            role: undefined, 
            status: undefined, 
            take: 1000, 
            skip: 0 
          });
          usersCount = usersData?.totalCount || 0;
        } catch (userError) {
          console.warn('Failed to fetch users count:', userError);
          // Keep default value of 0
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
      } catch (error) {
        console.error('Failed to fetch counts:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [getArticles, getCategories]);

  return { counts, loading };
}
