'use client';

import { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useGraphQL";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ArticleCategory } from "@/types/article";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { getCategories, loading, error } = useCategories();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await getCategories();
    if (response?.categories) {
      setCategories(response.categories);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    // For now, we'll just show the UI. The backend doesn't have category creation mutations yet.
    // This would need to be implemented in the GraphQL schema
    console.log('Creating category:', newCategoryName);
    setNewCategoryName("");
    setIsCreating(false);
  };

  const slugify = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Categories</h1>
          <p className="text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Categories</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Categories</h1>
          <p className="text-slate-600">Organize your content with categories.</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Create Category Form */}
      {isCreating && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category Name
              </label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="max-w-md"
              />
              {newCategoryName && (
                <p className="text-xs text-slate-500 mt-1">
                  Slug: {slugify(newCategoryName)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                Create Category
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setNewCategoryName("");
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{category.name}</h3>
                <p className="text-sm text-slate-500 mt-1">/{category.slug}</p>
                {category.createdAt && (
                  <p className="text-xs text-slate-400 mt-2">
                    Created {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No Categories Yet
          </h2>
          <p className="text-slate-600 mb-4">
            Create your first category to start organizing your content.
          </p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Category
          </Button>
        </Card>
      )}

      {/* Note about backend implementation */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-sm">ℹ️</div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Implementation Note</h4>
            <p className="text-sm text-blue-700 mt-1">
              Category creation and editing functionality requires additional GraphQL mutations 
              to be implemented in the backend. Currently, you can view existing categories 
              that are seeded in the database.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
