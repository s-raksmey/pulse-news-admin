// src/app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import UserStats from '../../components/user-management/UserStats';
import UserFilters from '../../components/user-management/UserFilters';
import UserList from '../../components/user-management/UserList';
import { UserService } from '../../services/user.gql';
import type { UserFilters as UserFiltersType } from '../../types/user';

export default function UsersPage() {
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
    // Check if getUserStats is available on component mount
    const checkStatsAvailability = async () => {
      const available = await UserService.checkGetUserStatsAvailability();
      setStatsAvailable(available);
    };
    
    checkStatsAvailability();
  }, []);

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
