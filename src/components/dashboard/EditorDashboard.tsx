// src/components/dashboard/EditorDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp, 
  Users,
  BarChart3,
  Star,
  AlertCircle,
  Eye,
  ThumbsUp,
  MessageSquare,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useEditorial } from '@/hooks/useEditorial';
import { 
  StatCard, 
  MetricCard, 
  ActivityFeed, 
  StatCardSkeleton, 
  MetricCardSkeleton,
  ActivityFeedSkeleton,
  type ActivityItem 
} from './shared';

export const EditorDashboard: React.FC = () => {
  const {
    loading,
    error,
    getEditorialStats,
    getPendingArticles,
    getRecentActions,
    getAuthorPerformance,
    approveArticle,
    rejectArticle,
    featureArticle
  } = useEditorial();

  const [stats, setStats] = useState<any>(null);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<ActivityItem[]>([]);
  const [authorPerformance, setAuthorPerformance] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const [statsData, articlesData, actionsData, performanceData] = await Promise.all([
        getEditorialStats(),
        getPendingArticles(10),
        getRecentActions(8),
        getAuthorPerformance(5)
      ]);

      setStats(statsData);
      setPendingArticles(articlesData);
      
      // Transform actions to ActivityItem format
      const transformedActions: ActivityItem[] = actionsData.map(action => ({
        id: action.id,
        type: action.type as any,
        title: action.articleTitle,
        description: `by ${action.authorName}`,
        user: { name: action.editorName },
        timestamp: action.timestamp,
        metadata: {
          category: 'Editorial'
        }
      }));
      setRecentActions(transformedActions);
      setAuthorPerformance(performanceData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleApprove = async (articleId: string) => {
    try {
      await approveArticle(articleId);
      await loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to approve article:', err);
    }
  };

  const handleReject = async (articleId: string) => {
    try {
      await rejectArticle(articleId);
      await loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to reject article:', err);
    }
  };

  const handleFeature = async (articleId: string) => {
    try {
      await featureArticle(articleId);
      await loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to feature article:', err);
    }
  };

  const filteredArticles = pendingArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Editorial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Content review and editorial management</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="border-gray-300"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading dashboard data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="p-4 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
            <Card className="p-4 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedThisWeek}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Featured Articles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featuredArticles}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Articles Review Queue */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Review Queue
                  </CardTitle>
                  <CardDescription>Articles pending editorial review</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No articles pending review</p>
                  <p className="text-sm">Great job staying on top of the review queue!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{article.title}</h3>
                            <Badge className={getPriorityColor(article.priority)}>
                              {article.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {article.category.name}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {article.authorName}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTimeAgo(article.submittedAt)}
                            </span>
                          </div>
                          
                          {article.excerpt && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFeature(article.id)}
                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(article.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(article.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Editorial Metrics */}
          <div className="space-y-4">
            {loading || !stats ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <MetricCard
                  title="Review Efficiency"
                  description="Average review time"
                  value={stats.avgReviewTime}
                  unit="hours"
                  icon={BarChart3}
                  color="blue"
                  showProgress={false}
                />
                <MetricCard
                  title="Content Quality Score"
                  description="Overall content rating"
                  value={stats.contentScore}
                  maxValue={100}
                  unit="%"
                  icon={TrendingUp}
                  color="green"
                  showProgress={true}
                />
              </>
            )}
          </div>

          {/* Recent Editorial Actions */}
          {loading ? (
            <ActivityFeedSkeleton />
          ) : (
            <ActivityFeed
              title="Recent Actions"
              activities={recentActions}
              maxItems={5}
              showViewAll={true}
              onViewAll={() => console.log('View all actions')}
            />
          )}
        </div>
      </div>

      {/* Author Performance */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Author Performance
          </CardTitle>
          <CardDescription>Top performing authors this month</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorPerformance.map((author) => (
                <div key={author.authorId} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{author.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {author.approvalRate}% approval
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Articles:</span>
                      <span className="font-medium">{author.articlesSubmitted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Review:</span>
                      <span className="font-medium">{author.avgReviewTime.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span className="font-medium">{author.categories.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
