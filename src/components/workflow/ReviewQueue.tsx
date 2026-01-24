// src/components/workflow/ReviewQueue.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWorkflowPermissions } from '../../hooks/usePermissions';
import { PermissionGuard, Permission } from '../permissions/PermissionGuard';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ReviewQueueData {
  articles: Article[];
  totalCount: number;
  hasMore: boolean;
}

interface WorkflowActionResult {
  success: boolean;
  message: string;
}

/**
 * Review Queue Component for Editors
 */
export const ReviewQueue: React.FC = () => {
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueData>({
    articles: [],
    totalCount: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingArticles, setProcessingArticles] = useState<Set<string>>(new Set());
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    categoryId: '',
    authorId: '',
    limit: 20,
    offset: 0,
  });

  const { canReview, canApprove, canReject } = useWorkflowPermissions();

  // Mock data for demonstration - replace with actual GraphQL query
  useEffect(() => {
    const fetchReviewQueue = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual GraphQL query
        // const { data } = await client.query({
        //   query: REVIEW_QUEUE_QUERY,
        //   variables: { filters }
        // });
        
        // Mock data
        const mockData: ReviewQueueData = {
          articles: [
            {
              id: '1',
              title: 'Breaking: Major Economic Policy Changes Announced',
              excerpt: 'Government announces significant changes to economic policy affecting businesses nationwide.',
              status: 'REVIEW',
              createdAt: '2024-01-20T10:00:00Z',
              updatedAt: '2024-01-20T14:30:00Z',
              author: {
                id: 'author1',
                name: 'John Reporter',
                email: 'john@example.com',
              },
              category: {
                id: 'cat1',
                name: 'Politics',
                slug: 'politics',
              },
            },
            {
              id: '2',
              title: 'Technology Trends Shaping the Future',
              excerpt: 'An in-depth look at emerging technologies and their potential impact.',
              status: 'REVIEW',
              createdAt: '2024-01-19T15:00:00Z',
              updatedAt: '2024-01-19T16:45:00Z',
              author: {
                id: 'author2',
                name: 'Sarah Tech',
                email: 'sarah@example.com',
              },
              category: {
                id: 'cat2',
                name: 'Technology',
                slug: 'technology',
              },
            },
          ],
          totalCount: 2,
          hasMore: false,
        };

        setReviewQueue(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load review queue');
        console.error('Review queue error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (canReview) {
      fetchReviewQueue();
    }
  }, [filters, canReview]);

  const handleWorkflowAction = async (articleId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    if (!canApprove && action === 'APPROVE') {
      alert('You do not have permission to approve articles');
      return;
    }
    if (!canReject && action === 'REJECT') {
      alert('You do not have permission to reject articles');
      return;
    }

    setProcessingArticles(prev => new Set(prev).add(articleId));

    try {
      // TODO: Replace with actual GraphQL mutation
      // const { data } = await client.mutate({
      //   mutation: PERFORM_WORKFLOW_ACTION,
      //   variables: {
      //     input: {
      //       articleId,
      //       action,
      //       reason,
      //       notifyAuthor: true,
      //     }
      //   }
      // });

      // Mock success
      const result: WorkflowActionResult = {
        success: true,
        message: `Article ${action.toLowerCase()}d successfully`,
      };

      if (result.success) {
        // Remove article from review queue
        setReviewQueue(prev => ({
          ...prev,
          articles: prev.articles.filter(article => article.id !== articleId),
          totalCount: prev.totalCount - 1,
        }));
        
        // Remove from selected articles
        setSelectedArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });

        alert(result.message);
      } else {
        alert(`Failed to ${action.toLowerCase()} article: ${result.message}`);
      }
    } catch (err) {
      console.error('Workflow action error:', err);
      alert(`Failed to ${action.toLowerCase()} article`);
    } finally {
      setProcessingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: 'APPROVE' | 'REJECT') => {
    if (selectedArticles.size === 0) {
      alert('Please select articles to process');
      return;
    }

    const reason = prompt(`Enter reason for bulk ${action.toLowerCase()} (optional):`);
    
    try {
      // TODO: Replace with actual GraphQL mutation
      // const { data } = await client.mutate({
      //   mutation: PERFORM_BULK_WORKFLOW_ACTION,
      //   variables: {
      //     input: {
      //       articleIds: Array.from(selectedArticles),
      //       action,
      //       reason,
      //       notifyAuthors: true,
      //     }
      //   }
      // });

      // Mock success
      alert(`Bulk ${action.toLowerCase()} completed for ${selectedArticles.size} articles`);
      
      // Remove processed articles from queue
      setReviewQueue(prev => ({
        ...prev,
        articles: prev.articles.filter(article => !selectedArticles.has(article.id)),
        totalCount: prev.totalCount - selectedArticles.size,
      }));
      
      setSelectedArticles(new Set());
    } catch (err) {
      console.error('Bulk workflow action error:', err);
      alert(`Failed to perform bulk ${action.toLowerCase()}`);
    }
  };

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const selectAllArticles = () => {
    if (selectedArticles.size === reviewQueue.articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(reviewQueue.articles.map(article => article.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading review queue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <PermissionGuard permissions={[Permission.REVIEW_ARTICLES]} showError>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
            <p className="text-gray-600 mt-1">
              {reviewQueue.totalCount} article{reviewQueue.totalCount !== 1 ? 's' : ''} pending review
            </p>
          </div>
          
          {/* Bulk Actions */}
          {selectedArticles.size > 0 && (
            <div className="flex space-x-2">
              <PermissionGuard permissions={[Permission.APPROVE_ARTICLES]}>
                <button
                  onClick={() => handleBulkAction('APPROVE')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve Selected ({selectedArticles.size})
                </button>
              </PermissionGuard>
              <PermissionGuard permissions={[Permission.REJECT_ARTICLES]}>
                <button
                  onClick={() => handleBulkAction('REJECT')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject Selected ({selectedArticles.size})
                </button>
              </PermissionGuard>
            </div>
          )}
        </div>

        {/* Articles List */}
        {reviewQueue.articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No articles pending review</div>
            <p className="text-gray-400 mt-2">All caught up! 🎉</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Select All Header */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedArticles.size === reviewQueue.articles.length && reviewQueue.articles.length > 0}
                  onChange={selectAllArticles}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select all ({reviewQueue.articles.length})
                </span>
              </label>
            </div>

            {/* Articles */}
            <div className="divide-y divide-gray-200">
              {reviewQueue.articles.map((article) => (
                <div key={article.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={() => toggleArticleSelection(article.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By {article.author.name}</span>
                            {article.category && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {article.category.name}
                              </span>
                            )}
                            <span>
                              Submitted {new Date(article.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 ml-4">
                          <PermissionGuard permissions={[Permission.APPROVE_ARTICLES]}>
                            <button
                              onClick={() => handleWorkflowAction(article.id, 'APPROVE')}
                              disabled={processingArticles.has(article.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {processingArticles.has(article.id) ? 'Processing...' : 'Approve'}
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permissions={[Permission.REJECT_ARTICLES]}>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason (optional):');
                                handleWorkflowAction(article.id, 'REJECT', reason || undefined);
                              }}
                              disabled={processingArticles.has(article.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {processingArticles.has(article.id) ? 'Processing...' : 'Reject'}
                            </button>
                          </PermissionGuard>
                          <button
                            onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default ReviewQueue;
