// src/app/users/page.tsx
'use client';

import React from 'react';
import { UserList } from '@/components/users/UserList';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function UsersPage() {
  return (
    <PermissionGuard requiredPermissions={['users.list']}>
      <UserList />
    </PermissionGuard>
  );
}
