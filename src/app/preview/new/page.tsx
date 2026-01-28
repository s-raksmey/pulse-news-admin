'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/components/permissions/PermissionGuard';
import ArticlePreview from '@/components/preview/ArticlePreview';
import PreviewHeader from '@/components/preview/PreviewHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText } from 'lucide-react';

interface NewArticleData {
  title: string;
  excerpt?: string;
  contentJson: string;
  topic?: string;
  coverImageUrl?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function NewArticlePreviewPage() {
  const router = useRouter();
  const { userRole, hasPermission, user, isLoading: permissionsLoading } = usePermissions();
  
  const [articleData, setArticleData] = useState<NewArticleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission to create articles
  const canCreateArticle = () => {
    return hasPermission(Permission.CREATE_ARTICLE);
  };

  // Load article data from localStorage (saved from new article form)
  useEffect(() => {
    if (permissionsLoading) return;
    
    // Check permissions first
    if (!canCreateArticle()) {
      setError('You do not have permission to create articles.');
      return;
    }

    try {
      // Try to get preview data from localStorage
      const previewData = localStorage.getItem('preview:new-article');
      
      if (previewData) {
        const parsedData = JSON.parse(previewData);
        setArticleData(parsedData);
      } else {
        setError('No preview data found. Please return to the article editor.');
      }
    } catch (err) {
      console.error('Error loading preview data:', err);
      setError('Failed to load preview data. Please try again.');
    }
  }, [permissionsLoading]);

  // Convert new article data to preview format
  const createPreviewArticle = (data: NewArticleData) => {
    if (!user) return null;
    
    return {
      id: 'new-article-preview',
      title: data.title || 'Untitled Article',
      slug: 'new-article-preview',
      excerpt: data.excerpt,
      contentJson: data.contentJson || '{"blocks":[{"type":"paragraph","data":{"text":"Start writing your article..."}}]}',
      status: 'DRAFT',
      topic: data.topic,
      coverImageUrl: data.coverImageUrl,
      authorName: user.email || 'Unknown Author',
      seoTitle: data.title,
      seoDescription: data.excerpt,
      ogImageUrl: data.coverImageUrl,
      isFeatured: false,
      isEditorsPick: false,
      isBreaking: false,
      pinnedAt: undefined,
      viewCount: 0,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: data.category,
    };
  };

  // Handle navigation back to editor
  const handleEdit = () => {
    router.push('/articles/new');
  };

  // Permission check loading
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading preview...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto pt-16 px-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/articles/new')}
              className="text-blue-600 hover:text-blue-700 underline mr-4"
            >
              Return to Editor
            </button>
            <button
              onClick={() => router.push('/articles')}
              className="text-gray-600 hover:text-gray-700 underline"
            >
              View All Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No preview data
  if (!articleData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto pt-16 px-6 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Preview Data</h1>
          <p className="text-gray-600 mb-6">
            No article data found for preview. Please return to the article editor and try again.
          </p>
          <button
            onClick={() => router.push('/articles/new')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Editor
          </button>
        </div>
      </div>
    );
  }

  const previewArticle = createPreviewArticle(articleData);
  
  if (!previewArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto pt-16 px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Preview Error</h1>
          <p className="text-gray-600 mb-6">
            Unable to generate preview. Please try again.
          </p>
          <button
            onClick={() => router.push('/articles/new')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Return to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <PreviewHeader
        isNewArticle={true}
        onEdit={handleEdit}
      />

      {/* New Article Notice */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <Alert className="border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This is a preview of your new article. Changes made in the editor will be reflected here after saving.
          </AlertDescription>
        </Alert>
      </div>

      {/* Article Preview */}
      <div className="py-4">
        <ArticlePreview article={previewArticle} isPreview={true} />
      </div>
    </div>
  );
}

