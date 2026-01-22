'use client';

import { useState, useEffect } from "react";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryForm, CategoryFormData } from "@/components/categories/CategoryForm";
import { Category, CategoryService } from "@/services/category.gql";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      const categoriesData = await CategoryService.getCategoriesWithTopics();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        // Update existing category
        await CategoryService.updateCategory(editingCategory.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
        });
      } else {
        // Create new category (without topics for now - backend compatibility)
        await CategoryService.createCategory({
          name: data.name,
          slug: data.slug,
          description: data.description,
          // topics: data.topics, // TODO: Enable when backend supports topics
        });
      }

      // Reload categories and close form
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setIsLoading(true);
    setError(null);

    try {
      await CategoryService.deleteCategory(category.id);

      // Reload categories
      await loadCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setError(null);
  };

  if (categoriesLoading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Categories</h1>
          <p className="text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Categories</h1>
        <p className="text-slate-600">Organize your content with categories.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-red-600 text-sm">⚠️</div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Categories List */}
      <CategoryList
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}
