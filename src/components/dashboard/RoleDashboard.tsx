// src/components/dashboard/RoleDashboard.tsx
'use client';

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../permissions/PermissionGuard';
import AdminDashboard from './AdminDashboard';
import EditorDashboard from './EditorDashboard';
import AuthorDashboard from './AuthorDashboard';

interface RoleDashboardProps {
  // Optional props to pass specific data to each dashboard
  adminStats?: any;
  editorStats?: any;
  authorStats?: any;
}

/**
 * Main dashboard component that renders the appropriate dashboard based on user role
 */
export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  adminStats,
  editorStats,
  authorStats,
}) => {
  const { userRole, isLoading } = usePermissions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Dashboard */}
      <PermissionGuard roles={['ADMIN']} fallback={null}>
        <AdminDashboard stats={adminStats} />
      </PermissionGuard>

      {/* Editor Dashboard */}
      <PermissionGuard roles={['EDITOR']} fallback={null}>
        <EditorDashboard stats={editorStats} />
      </PermissionGuard>

      {/* Author Dashboard */}
      <PermissionGuard roles={['AUTHOR']} fallback={null}>
        <AuthorDashboard stats={authorStats} />
      </PermissionGuard>

      {/* Fallback for unknown roles */}
      {!['ADMIN', 'EDITOR', 'AUTHOR'].includes(userRole || '') && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unknown Role</h1>
            <p className="text-gray-600 mb-4">
              Your user role ({userRole}) is not recognized.
            </p>
            <p className="text-sm text-gray-500">
              Please contact an administrator to assign you a proper role.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDashboard;

