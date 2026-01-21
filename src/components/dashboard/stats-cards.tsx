"use client";

import { motion, type Variants } from "framer-motion";
import {
  FileText,
  Eye,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  stats: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalViews: number;
    monthlyViews: number;
    totalUsers: number;
    activeUsers: number;
    recentActivity: number;
  };
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Articles",
      value: stats.totalArticles.toLocaleString(),
      icon: FileText,
      description: "All articles in system",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Published",
      value: stats.publishedArticles.toLocaleString(),
      icon: CheckCircle,
      description: "Live articles",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badge: {
        text: `${Math.round((stats.publishedArticles / stats.totalArticles) * 100)}%`,
        variant: "success" as const,
      },
    },
    {
      title: "Drafts",
      value: stats.draftArticles.toLocaleString(),
      icon: Clock,
      description: "Pending articles",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      badge: {
        text: `${Math.round((stats.draftArticles / stats.totalArticles) * 100)}%`,
        variant: "warning" as const,
      },
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      description: "All time views",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Monthly Views",
      value: stats.monthlyViews.toLocaleString(),
      icon: TrendingUp,
      description: "This month",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      badge: {
        text: "+12%",
        variant: "success" as const,
      },
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      icon: Users,
      description: "Last 30 days",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      badge: {
        text: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`,
        variant: "secondary" as const,
      },
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity.toLocaleString(),
      icon: Calendar,
      description: "Last 24 hours",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className={`hover:shadow-md transition-shadow border ${card.borderColor}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {card.value}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                  {card.badge && (
                    <Badge variant={card.badge.variant} className="ml-2">
                      {card.badge.text}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
