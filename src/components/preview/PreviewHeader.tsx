'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Share2, 
  ExternalLink,
  Clock,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/components/permissions/PermissionGuard';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PreviewHeaderProps {
  article?: Article;
  isNewArticle?: boolean;
  onEdit?: () => void;
  onPublish?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  article,
  isNewArticle = false,
  onEdit,
  onPublish,
  onApprove,
  onReject,
  className = ''
}) => {
  const router = useRouter();
  const { userRole, hasPermission, user } = usePermissions();

  const handleBack = () => {
    if (isNewArticle) {
      router.push('/articles/new');
    } else if (article) {
      router.push(`/articles/${article.id}/edit`);
    } else {
      router.push('/articles');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else if (article) {
      router.push(`/articles/${article.id}/edit`);
    } else {
      router.push('/articles/new');
    }
  };

  const handleShare = async () => {
    if (article?.slug) {
      const previewUrl = `${window.location.origin}/preview/${article.slug}`;
      try {
        await navigator.clipboard.writeText(previewUrl);
        // You might want to show a toast notification here
        alert('Preview URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleViewPublic = () => {
    if (article?.slug && article.status === 'PUBLISHED') {
      // Assuming there's a public site URL
      window.open(`/articles/${article.slug}`, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if current user can edit this article
  const canEdit = () => {
    if (!article) return true; // New articles can always be edited
    if (hasPermission(Permission.UPDATE_ANY_ARTICLE)) return true; // Admins and Editors
    if (hasPermission(Permission.UPDATE_OWN_ARTICLE) && user?.email === article.authorName) return true; // Authors can edit their own
    return false;
  };

  // Check if current user can publish this article
  const canPublish = () => {
    return hasPermission(Permission.PUBLISH_ARTICLE);
  };

  // Check if current user can approve/reject this article
  const canReview = () => {
    return hasPermission(Permission.REVIEW_ARTICLES);
  };

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-10 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back and Title */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </Button>

            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {isNewArticle ? 'New Article Preview' : article?.title || 'Article Preview'}
              </h1>
              
              {article && (
                <div className="flex items-center space-x-3 mt-1">
                  <Badge className={getStatusColor(article.status)}>
                    {article.status}
                  </Badge>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{article.authorName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      Updated {formatDistanceToNow(new Date(article.updatedAt))} ago
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Share Button */}
            {article && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Preview</span>
              </Button>
            )}

            {/* View Public Button (only for published articles) */}
            {article?.status === 'PUBLISHED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPublic}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Public</span>
              </Button>
            )}

            {/* Edit Button */}
            {canEdit() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>
            )}

            {/* Review Actions (for Editors) */}
            {canReview() && article?.status === 'REVIEW' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReject}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <span>Reject</span>
                </Button>
                
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <span>Approve</span>
                </Button>
              </>
            )}

            {/* Publish Button (for Editors/Admins) */}
            {canPublish() && article?.status !== 'PUBLISHED' && (
              <Button
                size="sm"
                onClick={onPublish}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Publish</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewHeader;

