'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/hooks/useGraphQL';
import { Article } from '@/types/article';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  REVIEW: "bg-yellow-100 text-yellow-800", 
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-red-100 text-red-800"
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    status: 'ALL',
    categorySlug: '',
    topic: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { searchArticles, loading, error } = useSearch();

  const performSearch = useCallback(async (query: string, page = 0, resetResults = true) => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    const searchInput = {
      query: query.trim(),
      categorySlug: filters.categorySlug || undefined,
      status: filters.status !== 'ALL' ? filters.status : undefined,
      authorName: filters.topic || undefined, // Map topic filter to authorName search
      take: 20,
      skip: page * 20,
      sortBy: 'relevance',
      sortOrder: 'desc',
    };

    const response = await searchArticles(searchInput);
    
    if (response?.searchArticles) {
      const newResults = response.searchArticles.articles || [];
      setResults(resetResults ? newResults : [...results, ...newResults]);
      setTotalCount(response.searchArticles.totalCount || 0);
      setHasMore(response.searchArticles.hasMore || false);
      setCurrentPage(page);
    }
  }, [searchArticles, filters, results]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery, 0, true);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filters]);

  const handleLoadMore = () => {
    performSearch(searchQuery, currentPage + 1, false);
  };

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      categorySlug: '',
      topic: '',
    });
  };

  const hasActiveFilters = (filters.status !== 'ALL' && filters.status) || filters.categorySlug || filters.topic;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Search Articles</h1>
        <p className="text-slate-600">Find articles, categories, and content across your site</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search articles, titles, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
              <Input
                placeholder="Category slug"
                value={filters.categorySlug}
                onChange={(e) => setFilters({...filters, categorySlug: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Topic</label>
              <Input
                placeholder="Topic"
                value={filters.topic}
                onChange={(e) => setFilters({...filters, topic: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-slate-600">
              {loading ? 'Searching...' : `${totalCount} results for "${searchQuery}"`}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((article) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600">
                        <Link href={`/articles/${article.id}/edit`}>
                          {article.title}
                        </Link>
                      </h3>
                      <Badge className={`text-xs ${statusColors[article.status]}`}>
                        {article.status}
                      </Badge>
                      {article.isFeatured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                      {article.isEditorsPick && <Badge variant="secondary" className="text-xs">Editor's Pick</Badge>}
                      {article.isBreaking && <Badge variant="destructive" className="text-xs">Breaking</Badge>}
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-slate-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>/{article.slug}</span>
                      {article.category && <span>{article.category.name}</span>}
                      {article.authorName && <span>by {article.authorName}</span>}
                      <span>{format(new Date(article.updatedAt), 'MMM d, yyyy')}</span>
                      <span>150 views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/${article.category?.slug || 'news'}/${article.topic || 'latest'}/${article.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/articles/${article.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        ) : searchQuery && !loading ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Start searching</h3>
            <p className="text-slate-600">
              Enter a search term to find articles, content, and more
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
