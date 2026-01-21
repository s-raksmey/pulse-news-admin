"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Plus,
  FileText,
  Edit,
  Settings,
  Users,
  BarChart3,
  Upload,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: "New Article",
    description: "Create a new article",
    href: "/articles/new",
    icon: Plus,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    title: "View Articles",
    description: "Manage all articles",
    href: "/articles",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    title: "Analytics",
    description: "View performance metrics",
    href: "/analytics",
    icon: BarChart3,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    title: "Media Library",
    description: "Upload and manage media",
    href: "/media",
    icon: Upload,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    title: "User Management",
    description: "Manage users and roles",
    href: "/users",
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    title: "Settings",
    description: "Configure system settings",
    href: "/settings",
    icon: Settings,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-slate-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.title} variants={itemVariants}>
                <Link href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border ${action.borderColor} ${action.bgColor} hover:shadow-md transition-all duration-200 cursor-pointer group`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}
