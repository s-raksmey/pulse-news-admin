// src/app/users/page.tsx
'use client';

import React from 'react';
import { UserList } from '@/components/users/UserList';
import { PermissionGuard, Permission } from '@/components/permissions/PermissionGuard';

export default function UsersPage() {
  return (
    <PermissionGuard permissions={[Permission.VIEW_ALL_USERS]} showError>
      <UserList />
    </PermissionGuard>
  );
}
