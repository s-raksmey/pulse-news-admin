'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { MediaFilters, MediaType } from '@/types/media';

interface MediaFiltersProps {
  filters: MediaFilters;
  onFiltersChange: (filters: MediaFilters) => void;
  folders?: string[];
  className?: string;
}

const mediaTypes: { value: MediaType; label: string }[] = [
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
  { value: 'other', label: 'Other' },
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
];

export function MediaFilters({
  filters,
  onFiltersChange,
  folders = [],
  className,
}: MediaFiltersProps) {
  const updateFilter = (key: keyof MediaFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.type ||
    filters.folder ||
    filters.tags?.length ||
    filters.dateFrom ||
    filters.dateTo
  );

  return (
    <div className={className}>
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {mediaTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Folder Filter */}
        {folders.length > 0 && (
          <Select
            value={filters.folder || 'all'}
            onValueChange={(value) => updateFilter('folder', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All folders</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={filters.sortBy || 'date'}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) => updateFilter('sortOrder', value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">A-Z</SelectItem>
              <SelectItem value="desc">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <button
                onClick={() => updateFilter('search', undefined)}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {mediaTypes.find(t => t.value === filters.type)?.label}
              <button
                onClick={() => updateFilter('type', undefined)}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.folder && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Folder: {filters.folder}
              <button
                onClick={() => updateFilter('folder', undefined)}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tags: {filters.tags.join(', ')}
              <button
                onClick={() => updateFilter('tags', undefined)}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
