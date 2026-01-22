'use client';

import { useState, useEffect } from "react";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryForm, CategoryFormData } from "@/components/categories/CategoryForm";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Category, CategoryService } from "@/services/category.gql";
import { seedCategoriesFromMegaNav, getCategoriesWithFallback } from "@/utils/seed-categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [seedingCategories, setSeedingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Confirmation dialog states
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CategoryFormData | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      
      // Use the robust fallback mechanism
      const categoriesData = await getCategoriesWithFallback();
      setCategories(categoriesData);
      
      console.log(`📋 Loaded ${categoriesData.length} categories for management`);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSeedCategories = async () => {
    try {
      setSeedingCategories(true);
      setError(null);
      
      await seedCategoriesFromMegaNav();
      await loadCategories(); // Reload after seeding
      
      alert('✅ Categories seeded successfully from MEGA_NAV!');
    } catch (err) {
      console.error('Error seeding categories:', err);
      setError('Failed to seed categories from MEGA_NAV');
    } finally {
      setSeedingCategories(false);
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
    // Store the form data and show confirmation dialog
    setPendingFormData(data);
    
    if (editingCategory) {
      setConfirmUpdateOpen(true);
    } else {
      setConfirmCreateOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!pendingFormData) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        // Update existing category
        await CategoryService.updateCategory(editingCategory.id, {
          name: pendingFormData.name,
          slug: pendingFormData.slug,
          description: pendingFormData.description,
        });
        
        console.log(`✅ Successfully updated category: ${pendingFormData.name}`);
      } else {
        // Create new category (topics will be created separately)
        const createdCategory = await CategoryService.createCategory({
          name: pendingFormData.name,
          slug: pendingFormData.slug,
          description: pendingFormData.description,
        });
        
        console.log(`✅ Successfully created category: ${pendingFormData.name} (ID: ${createdCategory.id})`);
        
        // Validate that we have the category ID before creating topics
        if (!createdCategory.id) {
          throw new Error('Category was created but ID is missing. Cannot create topics.');
        }
        
        // Create topics for the new category
        if (pendingFormData.topics && pendingFormData.topics.length > 0) {
          const topicResults = [];
          let successCount = 0;
          let failureCount = 0;
          
          for (const topicData of pendingFormData.topics) {
            try {
              const createdTopic = await CategoryService.createTopic({
                slug: topicData.slug,
                title: topicData.title,
                description: topicData.description,
                categoryId: createdCategory.id,
              });
              
              console.log(`✅ Successfully created topic: ${topicData.title}`);
              topicResults.push({ topic: topicData.title, success: true });
              successCount++;
            } catch (topicError: any) {
              console.error('Error creating topic:', topicError);
              const errorMessage = topicError.message || 'Unknown error';
              topicResults.push({ topic: topicData.title, success: false, error: errorMessage });
              failureCount++;
            }
          }
          
          // Provide user feedback about topic creation results
          if (failureCount > 0) {
            const failedTopics = topicResults
              .filter(result => !result.success)
              .map(result => `${result.topic} (${result.error})`)
              .join(', ');
            
            if (successCount > 0) {
              setError(`Category created successfully, but ${failureCount} topic(s) failed to create: ${failedTopics}`);
            } else {
              setError(`Category created but all ${failureCount} topics failed to create: ${failedTopics}`);
            }
          } else if (successCount > 0) {
            console.log(`✅ Successfully created category with ${successCount} topics`);
          }
        }
      }

      // Reload categories and close form
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
      setPendingFormData(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setPendingFormData(null);
    setConfirmCreateOpen(false);
    setConfirmUpdateOpen(false);
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
        onSeedCategories={handleSeedCategories}
        isLoading={isLoading}
        isSeedingCategories={seedingCategories}
      />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmCreateOpen}
        onOpenChange={setConfirmCreateOpen}
        title="Create Category"
        description={
          pendingFormData
            ? `Are you sure you want to create the category "${pendingFormData.name}"${
                pendingFormData.topics && pendingFormData.topics.length > 0
                  ? ` with ${pendingFormData.topics.length} topic(s)`
                  : ''
              }?`
            : ""
        }
        confirmText="Create"
        cancelText="Cancel"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirmation}
      />

      <ConfirmationDialog
        open={confirmUpdateOpen}
        onOpenChange={setConfirmUpdateOpen}
        title="Update Category"
        description={
          pendingFormData && editingCategory
            ? `Are you sure you want to update the category "${editingCategory.name}" to "${pendingFormData.name}"?`
            : ""
        }
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirmation}
      />
    </div>
  );
}
