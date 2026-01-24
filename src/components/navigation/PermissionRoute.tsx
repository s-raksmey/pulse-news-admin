// src/components/navigation/PermissionRoute.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard, Permission } from '../permissions/PermissionGuard';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  showError?: boolean;
}

/**
 * Route-level permission protection component
 * Redirects unauthorized users or shows error message
 */
export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  redirectTo = '/',
  showError = true,
}) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Handle unauthorized access
  const handleUnauthorized = () => {
    if (redirectTo && redirectTo !== window.location.pathname) {
      router.push(redirectTo);
      return null;
    }

    if (showError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <PermissionGuard
      permissions={permissions}
      roles={roles}
      requireAll={requireAll}
      fallback={handleUnauthorized()}
      showError={false}
    >
      {children}
    </PermissionGuard>
  );
};

export default PermissionRoute;

