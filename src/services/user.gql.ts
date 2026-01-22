// src/services/user.gql.ts
import { gql } from 'graphql-request';
import { getAuthenticatedGqlClient } from './graphql-client';
import type {
  User,
  UserListResult,
  UserStats,
  UserManagementResult,
  PasswordResetResult,
  ActivityLog,
  ListUsersInput,
  UpdateUserProfileInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  ChangePasswordInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from '../types/user';

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

const LIST_USERS_QUERY = gql`
  query ListUsers($input: ListUsersInput!) {
    listUsers(input: $input) {
      users {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
      totalCount
      hasMore
      filters {
        search
        role
        status
      }
    }
  }
`;

const GET_USER_BY_ID_QUERY = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_USER_STATS_QUERY = gql`
  query GetUserStats {
    getUserStats {
      totalUsers
      activeUsers
      inactiveUsers
      usersByRole {
        admin
        editor
        author
      }
      recentRegistrations
    }
  }
`;

const GET_USER_ACTIVITY_QUERY = gql`
  query GetUserActivity($userId: ID, $limit: Int) {
    getUserActivity(userId: $userId, limit: $limit) {
      id
      userId
      activityType
      details
      performedBy
      timestamp
      user {
        id
        name
        email
      }
    }
  }
`;

// ============================================================================
// GRAPHQL MUTATIONS
// ============================================================================

const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      success
      message
      user {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      success
      message
      user {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_USER_STATUS_MUTATION = gql`
  mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
    updateUserStatus(input: $input) {
      success
      message
      user {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
      user {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

const BULK_UPDATE_USER_ROLES_MUTATION = gql`
  mutation BulkUpdateUserRoles($userIds: [ID!]!, $role: UserRole!) {
    bulkUpdateUserRoles(userIds: $userIds, role: $role) {
      success
      message
    }
  }
`;

const BULK_UPDATE_USER_STATUS_MUTATION = gql`
  mutation BulkUpdateUserStatus($userIds: [ID!]!, $isActive: Boolean!) {
    bulkUpdateUserStatus(userIds: $userIds, isActive: $isActive) {
      success
      message
    }
  }
`;

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export class UserService {
  private static client = getAuthenticatedGqlClient();

  // Query Functions
  static async listUsers(input: ListUsersInput): Promise<UserListResult> {
    try {
      const response = await this.client.request<{ listUsers: UserListResult }>(
        LIST_USERS_QUERY,
        { input }
      );
      return response.listUsers;
    } catch (error) {
      console.error('Error listing users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async getUserById(id: string): Promise<User> {
    try {
      const response = await this.client.request<{ getUserById: User }>(
        GET_USER_BY_ID_QUERY,
        { id }
      );
      return response.getUserById;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user details');
    }
  }

  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.client.request<{ getUserStats: UserStats }>(
        GET_USER_STATS_QUERY
      );
      return response.getUserStats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  static async getUserActivity(userId?: string, limit?: number): Promise<ActivityLog[]> {
    try {
      const response = await this.client.request<{ getUserActivity: ActivityLog[] }>(
        GET_USER_ACTIVITY_QUERY,
        { userId, limit }
      );
      return response.getUserActivity;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw new Error('Failed to fetch user activity');
    }
  }

  // Mutation Functions
  static async updateUserProfile(input: UpdateUserProfileInput): Promise<UserManagementResult> {
    try {
      const response = await this.client.request<{ updateUserProfile: UserManagementResult }>(
        UPDATE_USER_PROFILE_MUTATION,
        { input }
      );
      return response.updateUserProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  static async updateUserRole(input: UpdateUserRoleInput): Promise<UserManagementResult> {
    try {
      const response = await this.client.request<{ updateUserRole: UserManagementResult }>(
        UPDATE_USER_ROLE_MUTATION,
        { input }
      );
      return response.updateUserRole;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  static async updateUserStatus(input: UpdateUserStatusInput): Promise<UserManagementResult> {
    try {
      const response = await this.client.request<{ updateUserStatus: UserManagementResult }>(
        UPDATE_USER_STATUS_MUTATION,
        { input }
      );
      return response.updateUserStatus;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  static async deleteUser(id: string): Promise<UserManagementResult> {
    try {
      const response = await this.client.request<{ deleteUser: UserManagementResult }>(
        DELETE_USER_MUTATION,
        { id }
      );
      return response.deleteUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  static async changePassword(input: ChangePasswordInput): Promise<PasswordResetResult> {
    try {
      const response = await this.client.request<{ changePassword: PasswordResetResult }>(
        CHANGE_PASSWORD_MUTATION,
        { input }
      );
      return response.changePassword;
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }

  static async requestPasswordReset(input: RequestPasswordResetInput): Promise<PasswordResetResult> {
    try {
      const response = await this.client.request<{ requestPasswordReset: PasswordResetResult }>(
        REQUEST_PASSWORD_RESET_MUTATION,
        { input }
      );
      return response.requestPasswordReset;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw new Error('Failed to request password reset');
    }
  }

  static async resetPassword(input: ResetPasswordInput): Promise<PasswordResetResult> {
    try {
      const response = await this.client.request<{ resetPassword: PasswordResetResult }>(
        RESET_PASSWORD_MUTATION,
        { input }
      );
      return response.resetPassword;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  static async bulkUpdateUserRoles(userIds: string[], role: string): Promise<UserManagementResult> {
    try {
      const response = await this.client.request<{ bulkUpdateUserRoles: UserManagementResult }>(
        BULK_UPDATE_USER_ROLES_MUTATION,
        { userIds, role }
      );
      return response.bulkUpdateUserRoles;
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      throw new Error('Failed to update user roles');
    }
  }

  static async bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<UserManagementResult> {
    try {
      const response = await this.client.request<{ bulkUpdateUserStatus: UserManagementResult }>(
        BULK_UPDATE_USER_STATUS_MUTATION,
        { userIds, isActive }
      );
      return response.bulkUpdateUserStatus;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  // Utility Functions
  static refreshClient(): void {
    this.client = getAuthenticatedGqlClient();
  }

  static getRoleDisplayName(role: string): string {
    const roleNames = {
      ADMIN: 'Administrator',
      EDITOR: 'Editor',
      AUTHOR: 'Author',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  }

  static getStatusDisplayName(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  static getRoleBadgeColor(role: string): string {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      EDITOR: 'bg-blue-100 text-blue-800',
      AUTHOR: 'bg-green-100 text-green-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  static getStatusBadgeColor(isActive: boolean): string {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }
}

