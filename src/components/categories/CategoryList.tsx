"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Category } from "@/services/category.gql";
import { Edit, Trash2, Plus } from "lucide-react";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onCreate: () => void;
  onSeedCategories?: () => void;
  isLoading?: boolean;
  isSeedingCategories?: boolean;
}

export function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  onCreate, 
  onSeedCategories,
  isLoading = false,
  isSeedingCategories = false
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || deletingId) return;

    setDeletingId(categoryToDelete.id);
    try {
      await onDelete(categoryToDelete);
    } finally {
      setDeletingId(null);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Categories ({categories.length})
          </h2>
          <p className="text-sm text-slate-600">
            Manage content categories for your articles
          </p>
        </div>
        <div className="flex gap-2">
          {onSeedCategories && (
            <Button 
              variant="outline" 
              onClick={onSeedCategories} 
              disabled={isLoading || isSeedingCategories}
            >
              {isSeedingCategories ? "Seeding..." : "Seed from MEGA_NAV"}
            </Button>
          )}
          <Button onClick={onCreate} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="text-slate-400 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No categories yet
          </h3>
          <p className="text-slate-600 mb-4">
            Create your first category to organize your articles, or seed categories from MEGA_NAV.
          </p>
          <div className="flex gap-2 justify-center">
            {onSeedCategories && (
              <Button 
                variant="outline" 
                onClick={onSeedCategories} 
                disabled={isLoading || isSeedingCategories}
              >
                {isSeedingCategories ? "Seeding..." : "Seed from MEGA_NAV"}
              </Button>
            )}
            <Button onClick={onCreate} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Topics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {category.description || (
                          <span className="italic text-slate-400">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {category.topics && category.topics.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {category.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {topic.title}
                              </span>
                            ))}
                            {category.topics.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{category.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-slate-400">No topics</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {formatDate(category.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(category)}
                          disabled={isLoading || deletingId === category.id}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                          disabled={isLoading || deletingId !== null}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          {deletingId === category.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Category"
        description={
          categoryToDelete
            ? `Are you sure you want to delete the category "${categoryToDelete.name}"? This action cannot be undone and will also delete all topics in this category.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
