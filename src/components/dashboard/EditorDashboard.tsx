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
      // Load core data first
      const [statsData, articlesData, actionsData] = await Promise.all([
        getEditorialStats(),
        getPendingArticles(10),
        getRecentActions(8)
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

      // Load author performance separately with error handling
      try {
        const performanceData = await getAuthorPerformance(5);
        setAuthorPerformance(performanceData);
      } catch (performanceError) {
        console.warn('Failed to load author performance data:', performanceError);
        // Set empty array so the UI can show a "no data" state instead of loading forever
        setAuthorPerformance([]);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header with Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Editorial Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Content review and editorial management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <FileText className="h-4 w-4 mr-2" />
              Review Queue
            </Button>
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Star className="h-4 w-4 mr-2" />
              Feature Article
            </Button>
          </div>
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

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading || !stats ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Pending Reviews Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 mb-1">Pending Reviews</p>
                      <p className="text-3xl font-bold text-orange-900">{stats.pendingReviews}</p>
                      <p className="text-xs text-orange-600 mt-1">Awaiting your review</p>
                    </div>
                    <div className="p-3 bg-orange-200 rounded-full group-hover:bg-orange-300 transition-colors">
                      <Clock className="h-6 w-6 text-orange-700" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 opacity-10">
                    <Clock className="h-16 w-16 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Approved Today Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Approved Today</p>
                      <p className="text-3xl font-bold text-green-900">{stats.approvedToday}</p>
                      <p className="text-xs text-green-600 mt-1">Great progress!</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-full group-hover:bg-green-300 transition-colors">
                      <CheckCircle className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 opacity-10">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Published This Week Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Published This Week</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.publishedThisWeek}</p>
                      <p className="text-xs text-blue-600 mt-1">Content live</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-full group-hover:bg-blue-300 transition-colors">
                      <Eye className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 opacity-10">
                    <Eye className="h-16 w-16 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Featured Articles Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700 mb-1">Featured Articles</p>
                      <p className="text-3xl font-bold text-yellow-900">{stats.featuredArticles}</p>
                      <p className="text-xs text-yellow-600 mt-1">Premium content</p>
                    </div>
                    <div className="p-3 bg-yellow-200 rounded-full group-hover:bg-yellow-300 transition-colors">
                      <Star className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 opacity-10">
                    <Star className="h-16 w-16 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Review Queue - Takes 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            {/* Priority Review Queue */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <FileText className="h-6 w-6 mr-3" />
                      Priority Review Queue
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-1">
                      Articles requiring immediate editorial attention
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-white/90"
                      />
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
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
                    <div key={article.id} className="group border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">{article.title}</h3>
                            <Badge className={`${getPriorityColor(article.priority)} font-medium`}>
                              {article.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700">
                              {article.category.name}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <span className="flex items-center font-medium">
                              <Users className="h-4 w-4 mr-2 text-blue-500" />
                              {article.authorName}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-orange-500" />
                              {formatTimeAgo(article.submittedAt)}
                            </span>
                            {article.wordCount && (
                              <span className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-green-500" />
                                {article.wordCount} words
                              </span>
                            )}
                          </div>
                          
                          {article.excerpt && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-4 bg-gray-50 p-3 rounded-lg">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-3 ml-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeature(article.id)}
                              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 transition-all"
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Feature
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(article.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(article.id)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve & Publish
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editorial Performance Overview */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-3" />
                Editorial Performance
              </CardTitle>
              <CardDescription className="text-purple-100">
                Your editorial workflow metrics and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-900">
                    {stats?.avgReviewTime?.toFixed(1) || '0.0'}h
                  </p>
                  <p className="text-sm text-blue-700 font-medium">Avg Review Time</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-900">
                    {stats?.contentScore || 0}%
                  </p>
                  <p className="text-sm text-green-700 font-medium">Quality Score</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-900">
                    {stats?.approvalRate || 0}%
                  </p>
                  <p className="text-sm text-purple-700 font-medium">Approval Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Star className="h-5 w-5 mr-3" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Bulk Review
              </Button>
              <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All High Priority
              </Button>
              <Button variant="outline" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                <Star className="h-4 w-4 mr-2" />
                Feature Management
              </Button>
              <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Editorial Actions */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-3" />
                Recent Actions
              </CardTitle>
              <CardDescription className="text-green-100">
                Your latest editorial decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <ActivityFeedSkeleton />
              ) : (
                <div className="space-y-3">
                  {recentActions.slice(0, 4).map((action) => (
                    <div key={action.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className={`p-2 rounded-full ${
                        action.type === 'approve' ? 'bg-green-100' :
                        action.type === 'reject' ? 'bg-red-100' :
                        action.type === 'feature' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {action.type === 'approve' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {action.type === 'reject' && <XCircle className="h-4 w-4 text-red-600" />}
                        {action.type === 'feature' && <Star className="h-4 w-4 text-yellow-600" />}
                        {action.type === 'publish' && <Eye className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {action.articleTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {action.authorName} • {formatTimeAgo(action.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-3 border-green-300 text-green-700 hover:bg-green-50">
                    View All Actions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editorial Goals */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-3" />
                Editorial Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Weekly Reviews</span>
                  <span className="text-gray-600">{stats?.approvedToday || 0}/25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((stats?.approvedToday || 0) / 25) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Quality Score</span>
                  <span className="text-gray-600">{stats?.contentScore || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.contentScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Author Performance Section */}
      {authorPerformance.length > 0 && (
        <div className="mt-8">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-3" />
                Top Author Performance
              </CardTitle>
              <CardDescription className="text-purple-100">
                Most active authors and their metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {authorPerformance.slice(0, 5).map((author, index) => (
                  <div key={author.authorId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{author.name}</p>
                        <p className="text-xs text-gray-500">
                          {author.articlesSubmitted} articles • {author.approvalRate}% approval rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{author.avgReviewTime}d</p>
                      <p className="text-xs text-gray-500">avg review</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      </div>
    </div>
  );
};
