// src/components/dashboard/EditorDashboard.tsx
'use client';

import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp, 
  Users,
  Calendar,
  Star,
  AlertCircle,
  Eye,
  ThumbsUp,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface EditorDashboardProps {
  stats?: {
    pendingReviews: number;
    approvedToday: number;
    rejectedToday: number;
    publishedThisWeek: number;
    totalAuthors: number;
    featuredArticles: number;
    avgReviewTime: number;
    contentScore: number;
  };
}

export const EditorDashboard: React.FC<EditorDashboardProps> = ({ 
  stats = {
    pendingReviews: 23,
    approvedToday: 8,
    rejectedToday: 3,
    publishedThisWeek: 45,
    totalAuthors: 28,
    featuredArticles: 12,
    avgReviewTime: 2.5,
    contentScore: 87,
  }
}) => {
  const pendingArticles = [
    { id: 1, title: 'Climate Change Impact on Agriculture', author: 'Sarah Johnson', submitted: '2 hours ago', priority: 'high', category: 'Environment' },
    { id: 2, title: 'Tech Industry Layoffs Continue', author: 'Mike Chen', submitted: '4 hours ago', priority: 'medium', category: 'Technology' },
    { id: 3, title: 'Local Election Results Analysis', author: 'Emma Davis', submitted: '6 hours ago', priority: 'high', category: 'Politics' },
    { id: 4, title: 'Restaurant Review: Downtown Bistro', author: 'Tom Wilson', submitted: '1 day ago', priority: 'low', category: 'Lifestyle' },
    { id: 5, title: 'Market Trends Q4 2024', author: 'Lisa Brown', submitted: '1 day ago', priority: 'medium', category: 'Business' },
  ];

  const recentActions = [
    { id: 1, action: 'Approved', article: 'Breaking News Update', author: 'John Smith', time: '30 minutes ago', type: 'approve' },
    { id: 2, action: 'Published', article: 'Weekly Market Report', author: 'Jane Doe', time: '1 hour ago', type: 'publish' },
    { id: 3, action: 'Rejected', article: 'Opinion Piece Draft', author: 'Bob Johnson', time: '2 hours ago', type: 'reject' },
    { id: 4, action: 'Featured', article: 'Tech Innovation Story', author: 'Alice Brown', time: '3 hours ago', type: 'feature' },
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', articles: 12, approvalRate: 95, category: 'Environment' },
    { name: 'Mike Chen', articles: 10, approvalRate: 88, category: 'Technology' },
    { name: 'Emma Davis', articles: 8, approvalRate: 92, category: 'Politics' },
    { name: 'Tom Wilson', articles: 15, approvalRate: 78, category: 'Lifestyle' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'approve': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'publish': return <Eye className="h-4 w-4 text-blue-600" />;
      case 'reject': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'feature': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editorial Dashboard</h1>
          <p className="text-gray-600 mt-1">Content review and editorial management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/review">
            <Button className="gap-2">
              <Clock className="h-4 w-4" />
              Review Queue ({stats.pendingReviews})
            </Button>
          </Link>
          <Link href="/articles/new">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.rejectedToday}</span> rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published This Week</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{stats.featuredArticles}</span> featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentScore}%</div>
            <Progress value={stats.contentScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Review Queue & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Priority Review Queue
            </CardTitle>
            <CardDescription>
              Articles awaiting editorial review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingArticles.slice(0, 5).map((article) => (
                <div key={article.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {article.title}
                      </h4>
                      <Badge variant="outline" className={getPriorityColor(article.priority)}>
                        {article.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      by {article.author} • {article.category} • {article.submitted}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/review">
                <Button variant="outline" className="w-full gap-2">
                  <Clock className="h-4 w-4" />
                  View All Pending Reviews ({stats.pendingReviews})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Editorial Actions
            </CardTitle>
            <CardDescription>
              Your recent review decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {getActionIcon(action.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{action.action}</span> article
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      "{action.article}" by {action.author}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {action.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performing Authors
            </CardTitle>
            <CardDescription>
              Authors with highest approval rates this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((author, index) => (
                <div key={author.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{author.name}</p>
                      <Badge variant="secondary">{author.approvalRate}%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {author.articles} articles • {author.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Editorial Metrics
            </CardTitle>
            <CardDescription>
              Your editorial performance this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Avg Review Time</span>
              </div>
              <Badge variant="secondary">{stats.avgReviewTime}h</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Approval Rate</span>
              </div>
              <Badge variant="secondary">73%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Featured Articles</span>
              </div>
              <Badge variant="secondary">{stats.featuredArticles}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Active Authors</span>
              </div>
              <Badge variant="secondary">{stats.totalAuthors}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Editorial Quick Actions</CardTitle>
          <CardDescription>
            Common editorial tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/review">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Clock className="h-6 w-6" />
                <span className="text-sm">Review Queue</span>
              </Button>
            </Link>
            <Link href="/articles/featured">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Star className="h-6 w-6" />
                <span className="text-sm">Manage Featured</span>
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Tags className="h-6 w-6" />
                <span className="text-sm">Categories</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorDashboard;
