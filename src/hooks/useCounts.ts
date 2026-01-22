'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch articles count
        const articlesResponse = await fetch('/api/articles');
        const articlesData = await articlesResponse.json();
        const articlesCount = articlesData.success ? (articlesData.articles?.length || 0) : 0;

        // Fetch users count
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();
        const usersCount = usersData.success ? (usersData.users?.length || 0) : 0;

        // Fetch media count
        const mediaResponse = await fetch('/api/media/upload');
        const mediaData = await mediaResponse.json();
        const mediaCount = mediaData.success ? (mediaData.files?.length || 0) : 0;

        // Fetch categories count
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        const categoriesCount = categoriesData.success ? (categoriesData.categories?.length || 0) : 0;

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
  }, []);

  return { counts, loading };
}
