// src/components/dashboard/shared/ActivityFeed.tsx
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'publish' | 'feature';
  title: string;
  description?: string;
  user?: {
    name: string;
    role?: string;
  };
  timestamp: string;
  metadata?: {
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: string;
  };
}

interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title,
  activities,
  loading = false,
  className,
  maxItems = 5,
  showViewAll = false,
  onViewAll
}) => {
  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'create': return '✨';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'approve': return '✅';
      case 'reject': return '❌';
      case 'publish': return '📢';
      case 'feature': return '⭐';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'publish': return 'bg-purple-100 text-purple-800';
      case 'feature': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          {showViewAll && activities.length > maxItems && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < displayActivities.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-6 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-3">
                  {/* Activity icon */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex items-center space-x-2 mt-2">
                          {activity.user && (
                            <span className="text-xs text-gray-500">
                              by {activity.user.name}
                            </span>
                          )}
                          {activity.metadata?.category && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.category}
                            </Badge>
                          )}
                          {activity.metadata?.priority && (
                            <Badge 
                              className={cn("text-xs", getPriorityColor(activity.metadata.priority))}
                            >
                              {activity.metadata.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

