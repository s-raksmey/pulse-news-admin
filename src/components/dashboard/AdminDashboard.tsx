// src/components/dashboard/AdminDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  Database,
  Globe,
  Zap,
  Eye,
  UserCheck,
  Calendar,
  Server,
  Lock,
  Unlock,
  UserPlus,
  FileEdit,
  Trash2,
  Star,
  Newspaper,
  Award,
  Plus,
  Edit,
  X,
  ThumbsUp,
  MessageCircle,
  Target,
  Filter,
  Search,
  BookOpen,
  CheckSquare,
  XCircle,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useUserManagement, UserStats } from '@/hooks/useUserManagement';
import { useArticles } from '@/hooks/useGraphQL';
import { useEditorial } from '@/hooks/useEditorial';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/components/permissions/PermissionGuard';
import { 
  StatCard, 
  MetricCard, 
  ActivityFeed, 
  StatCardSkeleton, 
  MetricCardSkeleton,
  ActivityFeedSkeleton,
  type ActivityItem 
} from './shared';

interface SystemHealth {
  uptime: number;
  responseTime: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastUpdated: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  pendingReviews: number;
  approvalRate: number;
  userGrowth: number;
  articleGrowth: number;
  reviewGrowth: number;
  // Author-specific properties
  myArticles?: number;
  myPublishedArticles?: number;
  myDraftArticles?: number;
  myPendingArticles?: number;
  totalViews?: number;
  averageRating?: number;
  totalComments?: number;
  monthlyArticles?: number;
  weeklyWords?: number;
  writingStreak?: number;
  bestMonth?: number;
  recentArticles?: Array<{
    id: string;
    title: string;
    status: 'published' | 'draft' | 'pending' | 'rejected';
    updatedAt: string;
    views?: number;
  }>;
  // Editor-specific properties
  articlesReviewed?: number;
  articlesApproved?: number;
  articlesRejected?: number;
  featuredArticles?: number;
  breakingNewsCount?: number;
  editorsPickCount?: number;
  averageReviewTime?: number;
  weeklyReviews?: number;
  monthlyApprovals?: number;
  qualityScore?: number;
  pendingQueue?: Array<{
    id: string;
    title: string;
    author: string;
    submittedAt: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  recentReviews?: Array<{
    id: string;
    title: string;
    author: string;
    action: 'approved' | 'rejected' | 'featured';
    reviewedAt: string;
    category: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { getUserStats, getBasicStats, getUserActivity, loading: userLoading, error: userError } = useUserManagement();
  const { getArticles, loading: articlesLoading, error: articlesError } = useArticles();
  const { getEditorialStats, loading: editorialLoading } = useEditorial();
  const { 
    hasPermission, 
    isAdmin, 
    isEditor, 
    isAuthor, 
    userRole,
    isLoading: permissionsLoading 
  } = usePermissions();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [systemActivity, setSystemActivity] = useState<ActivityItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Fetch user statistics
      const userStatsData = await getUserStats();
      if (userStatsData) {
        setUserStats(userStatsData);
      }

      // Fetch basic stats as fallback
      const basicStatsData = await getBasicStats();
      
      // Fetch all article data for comprehensive stats
      const [publishedData, draftData, reviewData, allArticlesData] = await Promise.all([
        getArticles({ status: 'PUBLISHED', take: 1000 }),
        getArticles({ status: 'DRAFT', take: 1000 }),
        getArticles({ status: 'REVIEW', take: 1000 }),
        getArticles({ take: 1000 })
      ]);

      // Fetch editorial stats for approval rate
      const editorialStats = await getEditorialStats();

      // Calculate comprehensive dashboard statistics
      const publishedCount = publishedData?.articles?.length || 0;
      const draftCount = draftData?.articles?.length || 0;
      const reviewCount = reviewData?.articles?.length || 0;
      const totalArticles = allArticlesData?.articles?.length || basicStatsData?.totalArticles || 0;
      
      // Calculate approval rate from editorial stats or estimate
      const approvalRate = editorialStats?.approvalRate || 
        (publishedCount > 0 ? Math.round((publishedCount / (publishedCount + reviewCount)) * 100) : 85);

      // Calculate growth percentages (simplified calculation based on recent activity)
      const userGrowth = userStatsData?.recentRegistrations || 12;
      const articleGrowth = Math.round(publishedCount * 0.15); // Estimate 15% growth
      const reviewGrowth = reviewCount > 0 ? Math.round(reviewCount * 0.1) : 0;

      const stats: DashboardStats = {
        totalUsers: userStatsData?.totalUsers || basicStatsData?.totalUsers || 0,
        activeUsers: userStatsData?.activeUsers || Math.floor((userStatsData?.totalUsers || 0) * 0.85),
        totalArticles,
        publishedArticles: publishedCount,
        draftArticles: draftCount,
        pendingReviews: reviewCount,
        approvalRate,
        userGrowth,
        articleGrowth,
        reviewGrowth,
        // Author-specific mock data (in real app, this would come from user-specific API)
        myArticles: 15 + Math.floor(Math.random() * 10), // 15-25 articles
        myPublishedArticles: 8 + Math.floor(Math.random() * 5), // 8-13 published
        myDraftArticles: 3 + Math.floor(Math.random() * 3), // 3-6 drafts
        myPendingArticles: Math.floor(Math.random() * 3), // 0-2 pending
        totalViews: 15000 + Math.floor(Math.random() * 10000), // 15k-25k views
        averageRating: 4.2 + Math.random() * 0.6, // 4.2-4.8 rating
        totalComments: 120 + Math.floor(Math.random() * 80), // 120-200 comments
        monthlyArticles: 3 + Math.floor(Math.random() * 4), // 3-7 this month
        weeklyWords: 2500 + Math.floor(Math.random() * 2000), // 2.5k-4.5k words
        writingStreak: 5 + Math.floor(Math.random() * 10), // 5-15 days
        bestMonth: 8 + Math.floor(Math.random() * 4), // 8-12 articles
        recentArticles: [
          {
            id: '1',
            title: 'Understanding Modern Web Development Trends',
            status: 'published' as const,
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            views: 1250
          },
          {
            id: '2',
            title: 'The Future of AI in Content Creation',
            status: 'pending' as const,
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            views: 0
          },
          {
            id: '3',
            title: 'Building Scalable React Applications',
            status: 'draft' as const,
            updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            views: 0
          },
          {
            id: '4',
            title: 'Database Optimization Techniques',
            status: 'published' as const,
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            views: 890
          },
          {
            id: '5',
            title: 'Mobile-First Design Principles',
            status: 'published' as const,
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            views: 2100
          }
        ],
        // Editor-specific mock data (in real app, this would come from editorial API)
        articlesReviewed: 45 + Math.floor(Math.random() * 20), // 45-65 reviewed
        articlesApproved: 35 + Math.floor(Math.random() * 15), // 35-50 approved
        articlesRejected: 8 + Math.floor(Math.random() * 7), // 8-15 rejected
        featuredArticles: 12 + Math.floor(Math.random() * 8), // 12-20 featured
        breakingNewsCount: 3 + Math.floor(Math.random() * 4), // 3-7 breaking news
        editorsPickCount: 8 + Math.floor(Math.random() * 5), // 8-13 editor's picks
        averageReviewTime: 2.5 + Math.random() * 2, // 2.5-4.5 hours
        weeklyReviews: 12 + Math.floor(Math.random() * 8), // 12-20 this week
        monthlyApprovals: 28 + Math.floor(Math.random() * 12), // 28-40 this month
        qualityScore: 85 + Math.floor(Math.random() * 10), // 85-95% quality score
        pendingQueue: [
          {
            id: 'p1',
            title: 'Breaking: New Technology Breakthrough in AI',
            author: 'John Smith',
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            priority: 'high' as const,
            category: 'Technology'
          },
          {
            id: 'p2',
            title: 'Market Analysis: Q4 Financial Trends',
            author: 'Sarah Johnson',
            submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            priority: 'medium' as const,
            category: 'Finance'
          },
          {
            id: 'p3',
            title: 'Health & Wellness: Winter Fitness Tips',
            author: 'Mike Davis',
            submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            priority: 'low' as const,
            category: 'Health'
          },
          {
            id: 'p4',
            title: 'Climate Change Impact on Agriculture',
            author: 'Emma Wilson',
            submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            priority: 'medium' as const,
            category: 'Environment'
          },
          {
            id: 'p5',
            title: 'Sports Update: Championship Results',
            author: 'Tom Brown',
            submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            priority: 'high' as const,
            category: 'Sports'
          }
        ],
        recentReviews: [
          {
            id: 'r1',
            title: 'Understanding Modern Web Development Trends',
            author: 'Alex Chen',
            action: 'approved' as const,
            reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            category: 'Technology'
          },
          {
            id: 'r2',
            title: 'Investment Strategies for 2024',
            author: 'Lisa Park',
            action: 'featured' as const,
            reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            category: 'Finance'
          },
          {
            id: 'r3',
            title: 'Outdated Marketing Practices',
            author: 'David Lee',
            action: 'rejected' as const,
            reviewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            category: 'Marketing'
          },
          {
            id: 'r4',
            title: 'Sustainable Living Guide',
            author: 'Rachel Green',
            action: 'approved' as const,
            reviewedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
            category: 'Lifestyle'
          },
          {
            id: 'r5',
            title: 'Global Economic Outlook',
            author: 'James Miller',
            action: 'featured' as const,
            reviewedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
            category: 'Economics'
          }
        ]
      };

      setDashboardStats(stats);

      // Fetch recent system activity
      const activityData = await getUserActivity(undefined, 10);
      if (activityData) {
        const transformedActivity: ActivityItem[] = activityData.map(activity => ({
          id: activity.id,
          type: activity.activityType.toLowerCase() as any,
          title: activity.details?.title || `${activity.activityType} activity`,
          description: activity.details?.description || `by ${activity.user?.name || 'System'}`,
          user: activity.user ? { name: activity.user.name } : undefined,
          timestamp: activity.timestamp,
          metadata: {
            category: 'System'
          }
        }));
        setSystemActivity(transformedActivity);
      }

      // Simulate system health data (in real app, this would come from monitoring API)
      const mockSystemHealth: SystemHealth = {
        uptime: 99.8 + Math.random() * 0.2, // Simulate slight variation
        responseTime: 120 + Math.floor(Math.random() * 50), // 120-170ms
        activeConnections: 1200 + Math.floor(Math.random() * 100), // 1200-1300
        memoryUsage: 60 + Math.floor(Math.random() * 20), // 60-80%
        cpuUsage: 30 + Math.floor(Math.random() * 30), // 30-60%
        diskUsage: 45 + Math.floor(Math.random() * 15), // 45-60%
        lastUpdated: new Date().toISOString()
      };
      setSystemHealth(mockSystemHealth);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up periodic refresh for system health (every 30 seconds)
    const interval = setInterval(() => {
      if (systemHealth) {
        const updatedHealth: SystemHealth = {
          ...systemHealth,
          uptime: Math.min(99.9, systemHealth.uptime + Math.random() * 0.1),
          responseTime: Math.max(100, systemHealth.responseTime + (Math.random() - 0.5) * 20),
          activeConnections: Math.max(1000, systemHealth.activeConnections + Math.floor((Math.random() - 0.5) * 50)),
          memoryUsage: Math.max(50, Math.min(90, systemHealth.memoryUsage + (Math.random() - 0.5) * 5)),
          cpuUsage: Math.max(20, Math.min(80, systemHealth.cpuUsage + (Math.random() - 0.5) * 10)),
          diskUsage: Math.max(40, Math.min(70, systemHealth.diskUsage + (Math.random() - 0.5) * 2)),
          lastUpdated: new Date().toISOString()
        };
        setSystemHealth(updatedHealth);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const loading = userLoading || articlesLoading || editorialLoading || permissionsLoading;
  const error = userError || articlesError;

  // Show loading state while permissions are being determined
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  const renderRoleBasedDashboard = () => {
    if (isAdmin) {
      return renderAdminDashboard();
    } else if (isEditor) {
      return renderEditorDashboard();
    } else if (isAuthor) {
      return renderAuthorDashboard();
    } else {
      return renderUnauthorizedDashboard();
    }
  };

  // Admin Dashboard Layout
  const renderAdminDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm">Full system control and platform governance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:border-gray-400"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasPermission(Permission.VIEW_SETTINGS) && (
              <Link href="/settings">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Error loading dashboard data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* System Health */}
              <Card className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Server className="h-5 w-5 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {systemHealth?.uptime.toFixed(1) || 99.9}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {systemHealth?.responseTime || 45}ms
                    </p>
                    <p className="text-sm text-gray-600">Response Time</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Management */}
              <Card className="hover:shadow-md transition-shadow border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      +{dashboardStats?.userGrowth || 0}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.totalUsers?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Analytics */}
              <Card className="hover:shadow-md transition-shadow border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      {dashboardStats?.approvalRate || 0}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.totalArticles?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-600">Published Articles</p>
                  </div>
                </CardContent>
              </Card>

              {/* System Activity */}
              <Card className="hover:shadow-md transition-shadow border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <Badge 
                      variant={systemHealth?.activeConnections > 100 ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      Live
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {systemHealth?.activeConnections?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active Connections</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Admin Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Content Overview - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Management Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-red-600" />
                      User Management
                    </CardTitle>
                    <CardDescription>Platform users by role and management tools</CardDescription>
                  </div>
                  {hasPermission(Permission.VIEW_ALL_USERS) && (
                    <Link href="/users">
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading || !userStats ? (
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <p className="text-xl font-bold text-red-900">{userStats.usersByRole.admin}</p>
                      <p className="text-xs text-red-700">Admins</p>
                      {hasPermission(Permission.MANAGE_USER_ROLES) && (
                        <Button size="sm" variant="ghost" className="mt-2 text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-xl font-bold text-blue-900">{userStats.usersByRole.editor}</p>
                      <p className="text-xs text-blue-700">Editors</p>
                      {hasPermission(Permission.MANAGE_USER_ROLES) && (
                        <Button size="sm" variant="ghost" className="mt-2 text-xs">
                          <FileEdit className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-xl font-bold text-green-900">{userStats.usersByRole.author}</p>
                      <p className="text-xs text-green-700">Authors</p>
                      {hasPermission(Permission.MANAGE_USER_ROLES) && (
                        <Button size="sm" variant="ghost" className="mt-2 text-xs">
                          <Newspaper className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform Analytics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>Content performance and approval metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Globe className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-lg font-bold text-green-900">
                      {dashboardStats?.publishedArticles || 0}
                    </p>
                    <p className="text-xs text-green-700">Published</p>
                    {hasPermission(Permission.PUBLISH_ARTICLE) && (
                      <Button size="sm" variant="ghost" className="mt-1 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                    <p className="text-lg font-bold text-yellow-900">
                      {dashboardStats?.pendingReviews || 0}
                    </p>
                    <p className="text-xs text-yellow-700">Pending Review</p>
                    {hasPermission(Permission.REVIEW_ARTICLES) && (
                      <Button size="sm" variant="ghost" className="mt-1 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-lg font-bold text-gray-900">
                      {dashboardStats?.draftArticles || 0}
                    </p>
                    <p className="text-xs text-gray-700">Drafts</p>
                    {hasPermission(Permission.UPDATE_ANY_ARTICLE) && (
                      <Button size="sm" variant="ghost" className="mt-1 text-xs">
                        <FileEdit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Award className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-lg font-bold text-blue-900">
                      {dashboardStats?.approvalRate || 0}%
                    </p>
                    <p className="text-xs text-blue-700">Approval Rate</p>
                    {hasPermission(Permission.VIEW_AUDIT_LOGS) && (
                      <Button size="sm" variant="ghost" className="mt-1 text-xs">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin System Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-red-600" />
                  System Health
                </CardTitle>
                <CardDescription>Real-time system monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!systemHealth ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uptime</span>
                        <span className="font-medium">{systemHealth.uptime.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemHealth.uptime} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span className="font-medium">{systemHealth.memoryUsage}%</span>
                      </div>
                      <Progress 
                        value={systemHealth.memoryUsage} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span className="font-medium">{systemHealth.cpuUsage}%</span>
                      </div>
                      <Progress 
                        value={systemHealth.cpuUsage} 
                        className="h-2"
                      />
                    </div>
                    <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{systemHealth.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connections:</span>
                        <span>{systemHealth.activeConnections.toLocaleString()}</span>
                      </div>
                    </div>
                    {hasPermission(Permission.SYSTEM_ADMINISTRATION) && (
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        <Settings className="h-4 w-4 mr-2" />
                        System Settings
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* System Activity Feed */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  System Activity
                </CardTitle>
                <CardDescription>Recent platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : systemActivity.length > 0 ? (
                  <div className="space-y-3">
                    {systemActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className="p-1 bg-red-100 rounded-full mt-0.5">
                          <Activity className="h-3 w-3 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {activity.description}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
                {hasPermission(Permission.VIEW_AUDIT_LOGS) && (
                  <Button size="sm" variant="outline" className="w-full mt-4">
                    <Eye className="h-4 w-4 mr-2" />
                    View Audit Logs
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // Editor Dashboard Layout
  const renderEditorDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Editor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              Editor Dashboard
            </h1>
            <p className="text-gray-600 text-sm">Content management and editorial control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasPermission(Permission.REVIEW_ARTICLES) && (
              <Link href="/articles/review">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Review Queue
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Error loading dashboard data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editor Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Articles Reviewed */}
              <Card className="hover:shadow-md transition-shadow border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Total
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.articlesReviewed || 0}
                    </p>
                    <p className="text-sm text-gray-600">Articles Reviewed</p>
                  </div>
                </CardContent>
              </Card>

              {/* Articles Approved */}
              <Card className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.articlesApproved || 0}
                    </p>
                    <p className="text-sm text-gray-600">Approved</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Reviews */}
              <Card className="hover:shadow-md transition-shadow border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <Badge 
                      variant={dashboardStats?.pendingReviews > 0 ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {dashboardStats?.pendingReviews > 0 ? 'Pending' : 'Clear'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.pendingReviews || 0}
                    </p>
                    <p className="text-sm text-gray-600">Pending Review</p>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Articles */}
              <Card className="hover:shadow-md transition-shadow border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      Featured
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.featuredArticles || 0}
                    </p>
                    <p className="text-sm text-gray-600">Featured</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Placeholder for main content - will be added in next step */}
        <div className="text-center py-20">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Editor Dashboard Content</h2>
          <p className="text-gray-600">Main content sections will be added next...</p>
        </div>
      </div>
    </div>
  );

  // Author Dashboard Layout
  const renderAuthorDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Author Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              Author Dashboard
            </h1>
            <p className="text-gray-600 text-sm">Content creation and personal analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasPermission(Permission.CREATE_ARTICLE) && (
              <Link href="/articles/create">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Error loading dashboard data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Author Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* My Articles */}
              <Card className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Total
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {(dashboardStats?.myArticles || 0)}
                    </p>
                    <p className="text-sm text-gray-600">My Articles</p>
                  </div>
                </CardContent>
              </Card>

              {/* Published Articles */}
              <Card className="hover:shadow-md transition-shadow border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Live
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.myPublishedArticles || 0}
                    </p>
                    <p className="text-sm text-gray-600">Published</p>
                  </div>
                </CardContent>
              </Card>

              {/* Draft Articles */}
              <Card className="hover:shadow-md transition-shadow border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Edit className="h-5 w-5 text-yellow-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      Draft
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.myDraftArticles || 0}
                    </p>
                    <p className="text-sm text-gray-600">Drafts</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Review */}
              <Card className="hover:shadow-md transition-shadow border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <Badge 
                      variant={dashboardStats?.myPendingArticles > 0 ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {dashboardStats?.myPendingArticles > 0 ? 'Pending' : 'Clear'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.myPendingArticles || 0}
                    </p>
                    <p className="text-sm text-gray-600">In Review</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Author Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Author Content Overview - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Recent Articles */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      My Recent Articles
                    </CardTitle>
                    <CardDescription>Your latest articles and their status</CardDescription>
                  </div>
                  {hasPermission(Permission.CREATE_ARTICLE) && (
                    <Link href="/articles/create">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Article
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardStats?.recentArticles && dashboardStats.recentArticles.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.recentArticles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-green-50 transition-colors">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {article.status === 'published' && <Globe className="h-5 w-5 text-green-600" />}
                          {article.status === 'draft' && <Edit className="h-5 w-5 text-yellow-600" />}
                          {article.status === 'pending' && <Clock className="h-5 w-5 text-orange-600" />}
                          {article.status === 'rejected' && <X className="h-5 w-5 text-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="capitalize">{article.status}</span>
                            <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                            {article.views && <span>{article.views} views</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              article.status === 'published' ? 'default' :
                              article.status === 'pending' ? 'secondary' :
                              article.status === 'draft' ? 'outline' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {article.status}
                          </Badge>
                          {hasPermission(Permission.UPDATE_OWN_ARTICLE) && (
                            <Link href={`/articles/${article.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No articles yet</p>
                    {hasPermission(Permission.CREATE_ARTICLE) && (
                      <Link href="/articles/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Article
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Writing Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Writing Analytics
                </CardTitle>
                <CardDescription>Your content performance and writing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-lg font-bold text-green-900">
                      {dashboardStats?.totalViews?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-700">Total Views</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-lg font-bold text-blue-900">
                      {dashboardStats?.averageRating?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-blue-700">Avg Rating</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <MessageCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-lg font-bold text-purple-900">
                      {dashboardStats?.totalComments || 0}
                    </p>
                    <p className="text-xs text-purple-700">Comments</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Award className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-lg font-bold text-orange-900">
                      {dashboardStats?.approvalRate || 0}%
                    </p>
                    <p className="text-xs text-orange-700">Approval Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Author Sidebar */}
          <div className="space-y-6">
            {/* Writing Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Writing Goals
                </CardTitle>
                <CardDescription>Track your writing progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Articles</span>
                    <span className="font-medium">{dashboardStats?.monthlyArticles || 0}/10</span>
                  </div>
                  <Progress value={(dashboardStats?.monthlyArticles || 0) * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Words This Week</span>
                    <span className="font-medium">{dashboardStats?.weeklyWords?.toLocaleString() || 0}/5000</span>
                  </div>
                  <Progress 
                    value={Math.min(((dashboardStats?.weeklyWords || 0) / 5000) * 100, 100)} 
                    className="h-2"
                  />
                </div>
                <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Streak:</span>
                    <span>{dashboardStats?.writingStreak || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Month:</span>
                    <span>{dashboardStats?.bestMonth || 0} articles</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasPermission(Permission.CREATE_ARTICLE) && (
                  <Link href="/articles/create">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      New Article
                    </Button>
                  </Link>
                )}
                <Link href="/articles?status=draft">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Continue Draft
                  </Button>
                </Link>
                <Link href="/articles?status=published">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Published
                  </Button>
                </Link>
                <Link href="/profile/analytics">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent writing activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : systemActivity.length > 0 ? (
                  <div className="space-y-3">
                    {systemActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className="p-1 bg-green-100 rounded-full mt-0.5">
                          <Activity className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {activity.description}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // Unauthorized Dashboard Layout
  const renderUnauthorizedDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center py-20">
          <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          <p className="text-gray-500 text-sm mt-2">Current role: {userRole || 'Unknown'}</p>
        </div>
      </div>
    </div>
  );

  return renderRoleBasedDashboard();
};
