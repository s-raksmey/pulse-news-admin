// src/components/user-management/UserStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Shield, Edit, PenTool, RefreshCw, AlertCircle } from 'lucide-react';
import { UserService } from '../../services/user.gql';
import type { UserStats as UserStatsType } from '../../types/user';

export default function UserStats() {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check if user stats feature is enabled
  const statsEnabled = process.env.NEXT_PUBLIC_ENABLE_USER_STATS !== 'false';

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserService.getUserStats();
      setStats(data);
      setRetryCount(0);
    } catch (err) {
      console.warn('getUserStats failed, attempting fallback:', err);
      
      // Try fallback method
      try {
        const fallbackStats = await UserService.getFallbackUserStats();
        if (fallbackStats) {
          setStats(fallbackStats);
          setRetryCount(0);
          return;
        }
      } catch (fallbackErr) {
        console.warn('Fallback stats also failed:', fallbackErr);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statsEnabled) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [statsEnabled]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 mb-1">
              User Statistics Temporarily Unavailable
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              We're having trouble loading user statistics right now. This doesn't affect your ability to manage users - you can still view, edit, and manage user accounts normally.
            </p>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Retrying...' : 'Try Again'}</span>
            </button>
            {retryCount > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                Retry attempt: {retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!statsEnabled) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              User Statistics Disabled
            </h3>
            <p className="text-sm text-blue-700">
              User statistics have been disabled in the configuration. All user management features remain fully functional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Recent Registrations',
      value: stats.recentRegistrations,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const roleCards = [
    {
      title: 'Administrators',
      value: stats.usersByRole.admin,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Editors',
      value: stats.usersByRole.editor,
      icon: Edit,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Authors',
      value: stats.usersByRole.author,
      icon: PenTool,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">User Roles Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleCards.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.title} className="flex items-center space-x-3 p-4 rounded-lg bg-slate-50">
                <div className={`p-2 rounded-lg ${role.bgColor}`}>
                  <Icon className={`h-5 w-5 ${role.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{role.title}</p>
                  <p className="text-xl font-bold text-slate-900">{role.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
