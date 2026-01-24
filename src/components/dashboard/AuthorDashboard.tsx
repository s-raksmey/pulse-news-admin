// src/components/dashboard/AuthorDashboard.tsx
'use client';

import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp, 
  Eye,
  Edit,
  Calendar,
  Target,
  Award,
  BookOpen,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface AuthorDashboardProps {
  stats?: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    inReviewArticles: number;
    rejectedArticles: number;
    totalViews: number;
    monthlyGoal: number;
    monthlyProgress: number;
    approvalRate: number;
  };
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({ 
  stats = {
    totalArticles: 24,
    publishedArticles: 18,
    draftArticles: 4,
    inReviewArticles: 2,
    rejectedArticles: 3,
    totalViews: 15420,
    monthlyGoal: 8,
    monthlyProgress: 6,
    approvalRate: 85,
  }
}) => {
  const recentArticles = [
    { 
      id: 1, 
      title: 'The Future of Renewable Energy', 
      status: 'published', 
      views: 1250, 
      publishedAt: '2 days ago',
      category: 'Environment'
    },
    { 
      id: 2, 
      title: 'AI in Healthcare: Opportunities and Challenges', 
      status: 'in_review', 
      submittedAt: '1 day ago',
      category: 'Technology'
    },
    { 
      id: 3, 
      title: 'Local Community Garden Initiative', 
      status: 'draft', 
      lastEdited: '3 hours ago',
      category: 'Community'
    },
    { 
      id: 4, 
      title: 'Economic Impact of Remote Work', 
      status: 'published', 
      views: 890, 
      publishedAt: '1 week ago',
      category: 'Business'
    },
    { 
      id: 5, 
      title: 'Climate Change and Urban Planning', 
      status: 'rejected', 
      rejectedAt: '3 days ago',
      feedback: 'Needs more data sources',
      category: 'Environment'
    },
  ];

  const writingTips = [
    { tip: 'Use compelling headlines to increase engagement', category: 'Headlines' },
    { tip: 'Include relevant statistics and data to support your arguments', category: 'Research' },
    { tip: 'Break up long paragraphs for better readability', category: 'Formatting' },
    { tip: 'Add relevant images and media to enhance your content', category: 'Media' },
  ];

  const upcomingDeadlines = [
    { title: 'Monthly Feature Article', dueDate: 'Due in 3 days', priority: 'high' },
    { title: 'Weekly Tech Review', dueDate: 'Due in 1 week', priority: 'medium' },
    { title: 'Community Spotlight', dueDate: 'Due in 2 weeks', priority: 'low' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_review': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'draft': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="text-gray-600 mt-1">Your writing journey and content management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/articles/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Article
            </Button>
          </Link>
          <Link href="/articles/drafts">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              My Drafts ({stats.draftArticles})
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inReviewArticles}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting editorial review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all published articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvalRate}%</div>
            <Progress value={stats.approvalRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal & Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Monthly Writing Goal
            </CardTitle>
            <CardDescription>
              Track your article publishing progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {stats.monthlyProgress} / {stats.monthlyGoal} articles
              </span>
            </div>
            <Progress value={(stats.monthlyProgress / stats.monthlyGoal) * 100} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.monthlyProgress}</div>
                <p className="text-xs text-gray-600">Published</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{stats.monthlyGoal - stats.monthlyProgress}</div>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
            </div>

            {stats.monthlyProgress >= stats.monthlyGoal && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-800">Goal Achieved! 🎉</p>
                <p className="text-xs text-green-600">Great work this month!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>
              Keep track of your writing commitments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                    <p className="text-xs text-gray-600">{deadline.dueDate}</p>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                View Editorial Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Articles
          </CardTitle>
          <CardDescription>
            Your latest writing activity and status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentArticles.map((article) => (
              <div key={article.id} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                {getStatusIcon(article.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </h4>
                    <Badge variant="outline" className={getStatusColor(article.status)}>
                      {article.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{article.category}</span>
                    {article.views && <span>{article.views} views</span>}
                    {article.publishedAt && <span>Published {article.publishedAt}</span>}
                    {article.submittedAt && <span>Submitted {article.submittedAt}</span>}
                    {article.lastEdited && <span>Edited {article.lastEdited}</span>}
                    {article.rejectedAt && <span>Rejected {article.rejectedAt}</span>}
                  </div>
                  {article.feedback && (
                    <p className="text-xs text-red-600 mt-1 italic">
                      Feedback: {article.feedback}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {article.status === 'draft' && (
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {article.status === 'published' && (
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href="/articles/my">
              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" />
                View All My Articles
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Writing Tips & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Writing Tips
            </CardTitle>
            <CardDescription>
              Improve your content with these editorial suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {writingTips.map((tip, index) => (
                <div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-blue-900">{tip.tip}</p>
                      <p className="text-xs text-blue-600 mt-1">{tip.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              Your writing statistics and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Published Articles</span>
              </div>
              <Badge variant="secondary">{stats.publishedArticles}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Draft Articles</span>
              </div>
              <Badge variant="secondary">{stats.draftArticles}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">In Review</span>
              </div>
              <Badge variant="secondary">{stats.inReviewArticles}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Avg Views per Article</span>
              </div>
              <Badge variant="secondary">{Math.round(stats.totalViews / stats.publishedArticles)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common writing and content management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/articles/new">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <PlusCircle className="h-6 w-6" />
                <span className="text-sm">New Article</span>
              </Button>
            </Link>
            <Link href="/articles/drafts">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Edit className="h-6 w-6" />
                <span className="text-sm">My Drafts</span>
              </Button>
            </Link>
            <Link href="/articles/my">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <FileText className="h-6 w-6" />
                <span className="text-sm">My Articles</span>
              </Button>
            </Link>
            <Link href="/media">
              <Button variant="outline" className="w-full gap-2 h-auto py-4 flex-col">
                <Image className="h-6 w-6" />
                <span className="text-sm">Media Library</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthorDashboard;

