// src/app/page.tsx
import { getGqlClient } from "@/services/graphql-client"
import { Q_ARTICLES } from "@/services/article.gql"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboard() {
  const client = getGqlClient()

  // Fetch data for dashboard
  const [published, drafts, allArticles] = await Promise.all([
    client.request(Q_ARTICLES, { status: "PUBLISHED", take: 100, skip: 0 }),
    client.request(Q_ARTICLES, { status: "DRAFT", take: 100, skip: 0 }),
    client.request(Q_ARTICLES, { take: 100, skip: 0 }),
  ])

  // Calculate stats
  const stats = {
    totalArticles: allArticles.articles?.length || 0,
    publishedArticles: published.articles?.length || 0,
    draftArticles: drafts.articles?.length || 0,
    totalViews: 125430, // Mock data - replace with real analytics
    monthlyViews: 23450, // Mock data - replace with real analytics
    totalUsers: 1250, // Mock data - replace with real user count
    activeUsers: 890, // Mock data - replace with real active user count
    recentActivity: 45, // Mock data - replace with real activity count
  }

  // Mock recent activity data - replace with real activity feed
  const recentActivities = [
    {
      id: "1",
      type: "create" as const,
      title: "New article created",
      description: "Article about latest technology trends",
      user: {
        name: "John Doe",
        initials: "JD",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      metadata: {
        articleTitle: published.articles?.[0]?.title || "Sample Article",
        status: "draft" as const,
      },
    },
    {
      id: "2",
      type: "publish" as const,
      title: "Article published",
      description: "Successfully published to the website",
      user: {
        name: "Jane Smith",
        initials: "JS",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      metadata: {
        articleTitle: published.articles?.[1]?.title || "Another Article",
        status: "published" as const,
      },
    },
    {
      id: "3",
      type: "edit" as const,
      title: "Article updated",
      description: "Made revisions to improve content quality",
      user: {
        name: "Mike Johnson",
        initials: "MJ",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      metadata: {
        articleTitle: drafts.articles?.[0]?.title || "Draft Article",
        status: "draft" as const,
      },
    },
    {
      id: "4",
      type: "view" as const,
      title: "High traffic article",
      description: "Article receiving significant reader engagement",
      user: {
        name: "System",
        initials: "SY",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      metadata: {
        articleTitle: published.articles?.[2]?.title || "Popular Article",
        status: "published" as const,
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, Admin! 👋
        </h1>
        <p className="text-slate-600">
          Here's what's happening with your Pulse News dashboard today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        {/* Recent Activity - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Latest Articles Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Latest Published Articles
          </h3>
          <div className="space-y-3">
            {published.articles?.slice(0, 3).map((article: any) => (
              <div key={article.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {article.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-slate-500">No published articles yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Drafts
          </h3>
          <div className="space-y-3">
            {drafts.articles?.slice(0, 3).map((article: any) => (
              <div key={article.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {article.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-slate-500">No draft articles yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
