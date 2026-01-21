"use client";

import { motion, type Variants } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Activity {
  id: string;
  type: "create" | "edit" | "delete" | "publish" | "view";
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  timestamp: string;
  metadata?: {
    articleTitle?: string;
    status?: "published" | "draft" | "archived";
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  create: FileText,
  edit: Edit,
  delete: Trash2,
  publish: CheckCircle,
  view: Eye,
};

const activityColors = {
  create: "text-blue-600",
  edit: "text-yellow-600",
  delete: "text-red-600",
  publish: "text-green-600",
  view: "text-purple-600",
};

const activityBgColors = {
  create: "bg-blue-50",
  edit: "bg-yellow-50",
  delete: "bg-red-50",
  publish: "bg-green-50",
  view: "bg-purple-50",
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-slate-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0"
        >
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const isLast = index === activities.length - 1;

            return (
              <motion.div key={activity.id} variants={itemVariants}>
                <div className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg ${activityBgColors[activity.type]} flex-shrink-0`}
                    >
                      <Icon
                        className={`h-4 w-4 ${activityColors[activity.type]}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {activity.metadata?.status && (
                            <Badge
                              variant={
                                activity.metadata.status === "published"
                                  ? "success"
                                  : activity.metadata.status === "draft"
                                  ? "warning"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {activity.metadata.status}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mt-1">
                        {activity.description}
                      </p>

                      {activity.metadata?.articleTitle && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          "{activity.metadata.articleTitle}"
                        </p>
                      )}

                      {/* User */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500">
                          {activity.user.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {!isLast && <Separator />}
              </motion.div>
            );
          })}
        </motion.div>

        {activities.length === 0 && (
          <div className="px-6 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
