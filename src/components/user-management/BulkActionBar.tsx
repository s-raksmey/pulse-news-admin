// src/components/user-management/BulkActionBar.tsx
'use client';

import { useState } from 'react';
import { Users, Shield, UserCheck, UserX, X } from 'lucide-react';
import { UserService } from '../../services/user.gql';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import type { UserRole } from '../../types/user';

interface BulkActionBarProps {
  selectedUserIds: string[];
  onClearSelection: () => void;
  onBulkActionComplete: () => void;
}

export default function BulkActionBar({ 
  selectedUserIds, 
  onClearSelection, 
  onBulkActionComplete 
}: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  // Confirmation dialog states
  const [confirmRoleChangeOpen, setConfirmRoleChangeOpen] = useState(false);
  const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole>('AUTHOR');
  const [pendingStatusActive, setPendingStatusActive] = useState(true);

  if (selectedUserIds.length === 0) return null;

  const handleBulkRoleUpdateRequest = (role: UserRole) => {
    setPendingRole(role);
    setConfirmRoleChangeOpen(true);
    setShowRoleMenu(false);
  };

  const handleConfirmBulkRoleUpdate = async () => {
    try {
      setIsProcessing(true);
      const result = await UserService.bulkUpdateUserRoles(selectedUserIds, pendingRole);
      
      if (result.success) {
        onBulkActionComplete();
        onClearSelection();
      }
    } catch (error) {
      console.error('Failed to update user roles:', error);
    } finally {
      setIsProcessing(false);
      setConfirmRoleChangeOpen(false);
    }
  };

  const handleBulkStatusUpdateRequest = (isActive: boolean) => {
    setPendingStatusActive(isActive);
    setConfirmStatusChangeOpen(true);
  };

  const handleConfirmBulkStatusUpdate = async () => {
    try {
      setIsProcessing(true);
      const result = await UserService.bulkUpdateUserStatus(selectedUserIds, pendingStatusActive);
      
      if (result.success) {
        onBulkActionComplete();
        onClearSelection();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setIsProcessing(false);
      setConfirmStatusChangeOpen(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Role Change Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Set Role for {selectedUserIds.length} users
                  </div>
                  {(['ADMIN', 'EDITOR', 'AUTHOR'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleBulkRoleUpdateRequest(role)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Shield className="h-4 w-4" />
                      <span>{UserService.getRoleDisplayName(role)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Actions */}
          <button
            onClick={() => handleBulkStatusUpdateRequest(true)}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Activate
          </button>

          <button
            onClick={() => handleBulkStatusUpdateRequest(false)}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <UserX className="h-4 w-4 mr-2" />
            Deactivate
          </button>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-700">Processing bulk action...</span>
        </div>
      )}
      
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmRoleChangeOpen}
        onOpenChange={setConfirmRoleChangeOpen}
        title="Bulk Role Change"
        description={`Are you sure you want to change the role of ${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} to ${UserService.getRoleDisplayName(pendingRole)}? This will affect their permissions and access levels.`}
        confirmText="Change Roles"
        cancelText="Cancel"
        variant="default"
        onConfirm={handleConfirmBulkRoleUpdate}
        onCancel={() => setConfirmRoleChangeOpen(false)}
      />

      <ConfirmationDialog
        open={confirmStatusChangeOpen}
        onOpenChange={setConfirmStatusChangeOpen}
        title={`Bulk ${pendingStatusActive ? 'Activate' : 'Deactivate'} Users`}
        description={`Are you sure you want to ${pendingStatusActive ? 'activate' : 'deactivate'} ${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''}? ${!pendingStatusActive ? 'They will no longer be able to access the system.' : 'They will regain access to the system.'}`}
        confirmText={pendingStatusActive ? 'Activate Users' : 'Deactivate Users'}
        cancelText="Cancel"
        variant={!pendingStatusActive ? 'destructive' : 'default'}
        onConfirm={handleConfirmBulkStatusUpdate}
        onCancel={() => setConfirmStatusChangeOpen(false)}
      />
    </div>
  );
}
