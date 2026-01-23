// src/types/user.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  profileData?: any;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserProfileInput {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface UpdateUserRoleInput {
  userId: string;
  role: UserRole;
}

export interface UpdateUserStatusInput {
  userId: string;
  isActive: boolean;
  reason?: string;
}

export interface ListUsersInput {
  take?: number;
  skip?: number;
  search?: string;
  role?: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResult {
  users: User[];
  totalCount: number;
  hasMore: boolean;
  filters: {
    search?: string;
    role?: string;
    status?: string;
  };
}

export interface UserManagementResult {
  success: boolean;
  message: string;
  user?: User;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    admin: number;
    editor: number;
    author: number;
  };
  recentRegistrations: number;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: string;
  details?: any;
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

