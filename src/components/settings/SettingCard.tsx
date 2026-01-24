'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCcw, Save, AlertCircle } from 'lucide-react';
import { Setting, formatSettingValue } from '@/services/settings.gql';
import { SettingInput } from './SettingInput';

interface SettingCardProps {
  setting: Setting;
  value: any;
  onChange: (value: any) => void;
  onSave: () => Promise<void>;
  onReset: () => Promise<void>;
  error?: string;
  loading?: boolean;
  hasChanges?: boolean;
}

export function SettingCard({
  setting,
  value,
  onChange,
  onSave,
  onReset,
  error,
  loading = false,
  hasChanges = false
}: SettingCardProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className={`transition-all duration-200 ${hasChanges ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-base font-medium">
              {setting.label}
            </CardTitle>
            {setting.isRequired && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
            {setting.isPublic && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {hasChanges && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unsaved changes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {setting.description && (
          <p className="text-sm text-slate-600 mt-1">
            {setting.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <SettingInput
          setting={setting}
          value={value}
          onChange={onChange}
          error={error}
          disabled={loading || isSaving || isResetting}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            <span className="font-mono">{setting.key}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={loading || isSaving || isResetting || !hasChanges}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset to default value</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading || isSaving || isResetting || !hasChanges}
              className="h-8 px-3"
            >
              {isSaving ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Save className="h-3 w-3" />
                  <span>Save</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
