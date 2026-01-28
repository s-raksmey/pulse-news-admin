'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentJson: string;
  status: string;
  topic?: string;
  coverImageUrl?: string;
  authorName: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  isFeatured: boolean;
  isEditorsPick: boolean;
  isBreaking: boolean;
  pinnedAt?: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ArticlePreviewProps {
  article: Article;
  isPreview?: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, isPreview = true }) => {
  // Parse content JSON to render article content
  const renderContent = () => {
    try {
      const content = JSON.parse(article.contentJson);
      // This is a simplified content renderer
      // In a real implementation, you'd want a proper rich text renderer
      if (content.blocks) {
        return content.blocks.map((block: any, index: number) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {block.data.text}
                </p>
              );
            case 'header':
              const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
              return (
                <HeaderTag key={index} className="font-bold mb-3 text-gray-900">
                  {block.data.text}
                </HeaderTag>
              );
            case 'list':
              return (
                <ul key={index} className="mb-4 ml-6 list-disc">
                  {block.data.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="mb-1 text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            case 'quote':
              return (
                <blockquote key={index} className="border-l-4 border-blue-500 pl-4 mb-4 italic text-gray-600">
                  {block.data.text}
                </blockquote>
              );
            default:
              return (
                <div key={index} className="mb-4 text-gray-700">
                  {block.data.text || JSON.stringify(block.data)}
                </div>
              );
          }
        });
      }
      return <p className="text-gray-700">{content}</p>;
    } catch (error) {
      // Fallback for plain text content
      return <p className="text-gray-700 whitespace-pre-wrap">{article.contentJson}</p>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      PUBLISHED: { color: 'bg-green-100 text-green-800', label: 'Published' },
      ARCHIVED: { color: 'bg-red-100 text-red-800', label: 'Archived' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <article className="max-w-4xl mx-auto bg-white">
      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">Preview Mode</span>
              {getStatusBadge(article.status)}
            </div>
            <div className="text-sm text-blue-600">
              Last updated: {formatDistanceToNow(new Date(article.updatedAt))} ago
            </div>
          </div>
        </div>
      )}

      {/* Article Header */}
      <header className="px-6 mb-8">
        {/* Special Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.isBreaking && (
            <Badge className="bg-red-500 text-white">Breaking News</Badge>
          )}
          {article.isFeatured && (
            <Badge className="bg-purple-500 text-white">Featured</Badge>
          )}
          {article.isEditorsPick && (
            <Badge className="bg-blue-500 text-white">Editor's Pick</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>By {article.authorName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {article.publishedAt 
                ? `Published ${formatDistanceToNow(new Date(article.publishedAt))} ago`
                : `Created ${formatDistanceToNow(new Date(article.createdAt))} ago`
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{article.viewCount} views</span>
          </div>

          {article.category && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{article.category.name}</span>
            </div>
          )}

          {article.topic && (
            <Badge variant="outline" className="text-xs">
              {article.topic}
            </Badge>
          )}
        </div>

        {/* Cover Image */}
        {article.coverImageUrl && (
          <div className="mb-8">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
      </header>

      {/* Article Content */}
      <div className="px-6 prose prose-lg max-w-none">
        {renderContent()}
      </div>

      {/* Article Footer */}
      <footer className="px-6 mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            Article ID: {article.id}
          </div>
          <div>
            Slug: /{article.slug}
          </div>
        </div>
      </footer>
    </article>
  );
};

export default ArticlePreview;

