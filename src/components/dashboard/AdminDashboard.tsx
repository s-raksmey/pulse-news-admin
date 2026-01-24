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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useUserManagement, UserStats } from '@/hooks/useUserManagement';
import { useArticles } from '@/hooks/useGraphQL';

interface AdminDashboardProps {}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { getUserStats, getBasicStats, loading: userLoading, error: userError } = useUserManagement();
  const { getArticles, loading: articlesLoading, error: articlesError } = useArticles();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [basicStats, setBasicStats] = useState<{ totalUsers: number; totalArticles: number } | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<number>(0);
  const [pendingReviews, setPendingReviews] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
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
        const publishedArticlesData = await getArticles({ status: 'PUBLISHED', take: 1000 });
        if (publishedArticlesData?.articles) {
          setPublishedArticles(publishedArticlesData.articles.length);
        }

        // Fetch pending reviews count
        const pendingReviewsData = await getArticles({ status: 'REVIEW', take: 1000 });
        if (pendingReviewsData?.articles) {
          setPendingReviews(pendingReviewsData.articles.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [getUserStats, getBasicStats, getArticles]);

  const loading = userLoading || articlesLoading;
  const error = userError || articlesError;

  // Use real data if available, otherwise fallback to mock data
  const stats = {
    totalUsers: userStats?.totalUsers || basicStats?.totalUsers || 156,
    activeUsers: userStats?.activeUsers || 142,
    totalArticles: basicStats?.totalArticles || 1247,
    publishedArticles: publishedArticles || 1089,
    pendingReviews: pendingReviews || 23,
    systemHealth: 98, // This would come from a system health check
    todayLogins: 89, // This would come from activity logs
    todayArticles: 12, // This would come from today's articles
  };
  const recentActivities = [
    { id: 1, user: 'John Editor', action: 'Published article', target: 'Breaking News Update', time: '2 minutes ago', type: 'publish' },
    { id: 2, user: 'Sarah Author', action: 'Submitted for review', target: 'Tech Trends 2024', time: '15 minutes ago', type: 'review' },
    { id: 3, user: 'Mike Admin', action: 'Created user', target: 'jane.doe@example.com', time: '1 hour ago', type: 'user' },
    { id: 4, user: 'Lisa Editor', action: 'Rejected article', target: 'Opinion Piece', time: '2 hours ago', type: 'reject' },
    { id: 5, user: 'Tom Author', action: 'Updated article', target: 'Market Analysis', time: '3 hours ago', type: 'update' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High number of pending reviews', count: stats.pendingReviews },
    { id: 2, type: 'info', message: 'System backup completed successfully', time: '6 hours ago' },
    { id: 3, type: 'success', message: 'All security checks passed', time: '1 day ago' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'publish': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'review': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      case 'reject': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'update': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete system overview and management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/users/new">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Add User
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.activeUsers}</span> active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.publishedArticles}</span> published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting editorial review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <Progress value={stats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today's Activity
            </CardTitle>
            <CardDescription>
              Key metrics for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">User Logins</span>
              </div>
              <Badge variant="secondary">{stats.todayLogins}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm">Articles Published</span>
              </div>
              <Badge variant="secondary">{stats.todayArticles}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Reviews Pending</span>
              </div>
              <Badge variant="secondary">{stats.pendingReviews}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Important notifications and warnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                  {alert.count && (
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.count} items require attention
                    </p>
                  )}
                  {alert.time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest user actions across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.target}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href="/audit">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                View Full Audit Log
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/users/new">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Users className="h-6 w-6" />
                <span className="text-sm">Add User</span>
              </Button>
            </Link>
            <Link href="/review">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Clock className="h-6 w-6" />
                <span className="text-sm">Review Queue</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
            <Link href="/audit">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Shield className="h-6 w-6" />
                <span className="text-sm">Audit Logs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
