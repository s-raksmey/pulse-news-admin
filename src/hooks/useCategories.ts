import { useState, useEffect } from 'react';
import { getAuthenticatedGqlClient } from '@/services/graphql-client';
import { Q_CATEGORIES } from '@/services/article.gql';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isValidCategory: (slug: string) => boolean;
  getCategoryBySlug: (slug: string) => Category | undefined;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        const client = getAuthenticatedGqlClient();
        const data = await client.request(Q_CATEGORIES);
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const isValidCategory = (slug: string): boolean => {
    return categories.some(cat => cat.slug === slug);
  };

  const getCategoryBySlug = (slug: string): Category | undefined => {
    return categories.find(cat => cat.slug === slug);
  };

  return {
    categories,
    loading,
    error,
    isValidCategory,
    getCategoryBySlug,
  };
}

