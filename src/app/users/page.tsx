// src/app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserStats from '../../components/user-management/UserStats';
import UserFilters from '../../components/user-management/UserFilters';
import UserList from '../../components/user-management/UserList';
import { UserService } from '../../services/user.gql';
import { useAuth } from '../../contexts/AuthContext';
import type { UserFilters as UserFiltersType } from '../../types/user';

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    role: 'ALL',
    status: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [statsAvailable, setStatsAvailable] = useState<boolean | null>(null);

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: 'ALL',
      status: 'ALL',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  useEffect(() => {
    // Debug logging
    console.log('Users Page Debug - isLoading:', isLoading);
    console.log('Users Page Debug - user:', user);
    console.log('Users Page Debug - user.role:', user?.role);
    console.log('Users Page Debug - user.role !== "ADMIN":', user?.role !== 'ADMIN');
    
    // Check user authorization
    if (!isLoading && user) {
      if (user.role !== 'ADMIN') {
        console.log('Users Page Debug - Redirecting non-admin user to dashboard');
        // Redirect non-admin users to dashboard
        router.push('/');
        return;
      } else {
        console.log('Users Page Debug - User is ADMIN, allowing access');
      }
    }

    // Check if getUserStats is available on component mount
    const checkStatsAvailability = async () => {
      const available = await UserService.checkGetUserStatsAvailability();
      setStatsAvailable(available);
    };
    
    if (user?.role === 'ADMIN') {
      checkStatsAvailability();
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users (shouldn't reach here due to redirect, but just in case)
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Users
        </h1>
        <p className="text-slate-600">
          Manage user accounts, roles, and permissions across your news platform.
        </p>
      </div>

      {/* User Statistics */}
      <UserStats />

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* User List */}
      <UserList filters={filters} />
    </div>
  );
}
