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
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useUserManagement, UserStats } from '@/hooks/useUserManagement';
import { useArticles } from '@/hooks/useGraphQL';
import { 
  StatCard, 
  MetricCard, 
  ActivityFeed, 
  StatCardSkeleton, 
  MetricCardSkeleton,
  ActivityFeedSkeleton,
  type ActivityItem 
} from './shared';

export const AdminDashboard: React.FC = () => {
  const { getUserStats, getBasicStats, getUserActivity, loading: userLoading, error: userError } = useUserManagement();
  const { getArticles, loading: articlesLoading, error: articlesError } = useArticles();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [basicStats, setBasicStats] = useState<{ totalUsers: number; totalArticles: number } | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<number>(0);
  const [pendingReviews, setPendingReviews] = useState<number>(0);
  const [systemActivity, setSystemActivity] = useState<ActivityItem[]>([]);
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
      if (basicStatsData) {
        setBasicStats(basicStatsData);
      }

      // Fetch published articles count
      const publishedData = await getArticles({ status: 'PUBLISHED', take: 1000 });
      if (publishedData?.articles) {
        setPublishedArticles(publishedData.articles.length);
      }

      // Fetch pending reviews count
      const pendingData = await getArticles({ status: 'PENDING', take: 1000 });
      if (pendingData?.articles) {
        setPendingReviews(pendingData.articles.length);
      }

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const loading = userLoading || articlesLoading;
  const error = userError || articlesError;

  // Mock system health data (would come from backend monitoring)
  const systemHealth = {
    uptime: 99.9,
    responseTime: 145,
    activeConnections: 1247,
    memoryUsage: 68
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">System overview and platform management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/settings">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading dashboard data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={userStats?.totalUsers || basicStats?.totalUsers || 0}
              icon={Users}
              gradient="from-blue-500 to-blue-600"
              change={{
                value: userStats?.recentRegistrations || 12,
                type: 'increase',
                period: 'this month'
              }}
            />
            <StatCard
              title="Active Users"
              value={userStats?.activeUsers || Math.floor((userStats?.totalUsers || 0) * 0.85)}
              icon={Activity}
              gradient="from-green-500 to-emerald-500"
              change={{
                value: 8,
                type: 'increase',
                period: 'vs last month'
              }}
            />
            <StatCard
              title="Total Articles"
              value={basicStats?.totalArticles || publishedArticles}
              icon={FileText}
              gradient="from-purple-500 to-pink-500"
              change={{
                value: 15,
                type: 'increase',
                period: 'this month'
              }}
            />
            <StatCard
              title="Pending Reviews"
              value={pendingReviews}
              icon={Clock}
              gradient="from-yellow-500 to-orange-500"
              change={{
                value: pendingReviews > 0 ? 100 : 0,
                type: pendingReviews > 0 ? 'neutral' : 'decrease',
                period: 'in queue'
              }}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Overview */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    User Management
                  </CardTitle>
                  <CardDescription>Platform user statistics and role distribution</CardDescription>
                </div>
                <Link href="/users">
                  <Button variant="outline" size="sm">
                    Manage Users
                  </Button>
                </Link>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading || !userStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Admin Users */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-8 w-8 text-red-600" />
                      <Badge className="bg-red-100 text-red-800">Admin</Badge>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{userStats.usersByRole.admin}</p>
                    <p className="text-sm text-red-700">System Administrators</p>
                  </div>

                  {/* Editor Users */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800">Editor</Badge>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{userStats.usersByRole.editor}</p>
                    <p className="text-sm text-blue-700">Content Editors</p>
                  </div>

                  {/* Author Users */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-8 w-8 text-green-600" />
                      <Badge className="bg-green-100 text-green-800">Author</Badge>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{userStats.usersByRole.author}</p>
                    <p className="text-sm text-green-700">Content Authors</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Health Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <MetricCard
            title="System Health"
            description="Overall platform status"
            value={systemHealth.uptime}
            maxValue={100}
            unit="%"
            icon={Database}
            color="green"
            showProgress={true}
          >
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className="font-medium">{systemHealth.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <span className="font-medium">{systemHealth.activeConnections.toLocaleString()}</span>
              </div>
            </div>
          </MetricCard>

          {/* Memory Usage */}
          <MetricCard
            title="Memory Usage"
            description="Server resource utilization"
            value={systemHealth.memoryUsage}
            maxValue={100}
            unit="%"
            icon={BarChart3}
            color={systemHealth.memoryUsage > 80 ? 'red' : systemHealth.memoryUsage > 60 ? 'yellow' : 'green'}
            showProgress={true}
          />

          {/* Recent System Activity */}
          {loading ? (
            <ActivityFeedSkeleton />
          ) : (
            <ActivityFeed
              title="System Activity"
              activities={systemActivity}
              maxItems={5}
              showViewAll={true}
              onViewAll={() => console.log('View all system activity')}
            />
          )}
        </div>
      </div>

      {/* Platform Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Statistics */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Content Analytics
            </CardTitle>
            <CardDescription>Platform content performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-900">{publishedArticles}</p>
                <p className="text-sm text-purple-700">Published Articles</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                <p className="text-2xl font-bold text-indigo-900">{pendingReviews}</p>
                <p className="text-sm text-indigo-700">Pending Reviews</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Content Approval Rate</span>
                <span className="font-semibold text-gray-900">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/users">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Users className="h-4 w-4 mr-3" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/articles">
                <Button variant="outline" className="w-full justify-start h-12">
                  <FileText className="h-4 w-4 mr-3" />
                  Review Articles
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Settings className="h-4 w-4 mr-3" />
                  System Settings
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start h-12">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

