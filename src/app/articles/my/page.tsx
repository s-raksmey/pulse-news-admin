'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useArticles, useArticleMutations } from "@/hooks/useGraphQL";
import { Button } from "@/components/ui/button";
import type { Article, ArticleStatus } from "@/types/article";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  REVIEW: "bg-yellow-100 text-yellow-800", 
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-red-100 text-red-800"
};

export default function MyArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | undefined>();
  const { getArticles, loading, error } = useArticles();
  const { setArticleStatus, deleteArticle, loading: mutationLoading } = useArticleMutations();
  const { user } = useAuth();
  const { userRole, hasPermission, isAdmin } = usePermissions();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Frontend Debug - My Articles page loaded');
    console.log('🔍 Frontend Debug - User:', user);
    console.log('🔍 Frontend Debug - User Role:', userRole);
    console.log('🔍 Frontend Debug - Is Admin:', isAdmin);
    console.log('🔍 Frontend Debug - Has CREATE_ARTICLE permission:', hasPermission && hasPermission('CREATE_ARTICLE' as any));
  }, [user, userRole, isAdmin, hasPermission]);

  useEffect(() => {
    loadMyArticles();
  }, [statusFilter, user]);

  const loadMyArticles = async () => {
    if (!user?.id) {
      console.log('🔍 Frontend Debug - No user ID available, skipping article load');
      return;
    }

    console.log('🔍 Frontend Debug - Loading MY articles for user ID:', user.id, 'with filter:', statusFilter);
    const response = await getArticles({ 
      status: statusFilter,
      authorId: user.id // Filter to only current user's articles
    });
    
    if (response?.data?.articles) {
      console.log('🔍 Frontend Debug - My articles loaded:', response.data.articles.length, 'articles');
      console.log('🔍 Frontend Debug - Sample article IDs:', response.data.articles.slice(0, 3).map((a: Article) => a.id));
      setArticles(response.data.articles);
    } else {
      console.log('🔍 Frontend Debug - No articles data in response:', response);
      setArticles([]);
    }
  };

  const handleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    try {
      await setArticleStatus(articleId, newStatus);
      loadMyArticles(); // Reload articles after status change
    } catch (error) {
      console.error('Error updating article status:', error);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(articleId);
        loadMyArticles(); // Reload articles after deletion
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading your articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading articles: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Articles</h1>
          <p className="text-muted-foreground">
            Manage your personal articles
          </p>
        </div>
        <Link href="/articles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Debug Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Info (My Articles)</h3>
        <div className="grid grid-cols-2 gap-2 text-blue-700">
          <div><strong>User Email:</strong> {user?.email || 'Not available'}</div>
          <div><strong>User ID:</strong> {user?.id || 'Not available'}</div>
          <div><strong>User Role:</strong> {userRole || 'Not available'}</div>
          <div><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</div>
          <div><strong>Articles Count:</strong> {articles.length}</div>
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>Status Filter:</strong> {statusFilter || 'None'}</div>
          <div><strong>Error:</strong> {error || 'None'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status: {statusFilter || 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('DRAFT')}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('REVIEW')}>
              Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('PUBLISHED')}>
              Published
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('ARCHIVED')}>
              Archived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Articles Table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Title</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Created</th>
                <th className="text-left p-4 font-medium">Updated</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    {user?.id ? 'No articles found. Create your first article!' : 'Please log in to view your articles.'}
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <Link 
                          href={`/articles/${article.id}`}
                          className="font-medium hover:underline"
                        >
                          {article.title}
                        </Link>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.excerpt.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[article.status]}>
                        {article.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {article.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(article.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(article.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/articles/${article.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/articles/${article.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {article.status === 'DRAFT' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(article.id, 'REVIEW')}
                              disabled={mutationLoading}
                            >
                              Submit for Review
                            </DropdownMenuItem>
                          )}
                          {article.status === 'REVIEW' && isAdmin && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(article.id, 'PUBLISHED')}
                                disabled={mutationLoading}
                              >
                                Publish
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(article.id, 'DRAFT')}
                                disabled={mutationLoading}
                              >
                                Send Back to Draft
                              </DropdownMenuItem>
                            </>
                          )}
                          {article.status === 'PUBLISHED' && isAdmin && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(article.id, 'ARCHIVED')}
                              disabled={mutationLoading}
                            >
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(article.id)}
                            disabled={mutationLoading}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
