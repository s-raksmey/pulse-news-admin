"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, Topic, CreateTopicInput } from "@/services/category.gql";

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  topics?: CreateTopicInput[];
}

interface TopicFormData {
  title: string;
  slug: string;
  description?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    topics: [],
  });

  const [topics, setTopics] = useState<TopicFormData[]>(
    // Handle case where category.topics might not exist yet (backend compatibility)
    category?.topics?.map(topic => ({
      title: topic.title,
      slug: topic.slug,
      description: topic.description || "",
    })) || []
  );

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [autoSlug, setAutoSlug] = useState(!category); // Auto-generate slug for new categories

  // Auto-generate slug when name changes (only for new categories)
  useEffect(() => {
    if (autoSlug && formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(formData.name)
      }));
    }
  }, [formData.name, autoSlug]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Category slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTopic = () => {
    setTopics([...topics, { title: "", slug: "", description: "" }]);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, field: keyof TopicFormData, value: string) => {
    const updatedTopics = [...topics];
    updatedTopics[index] = { ...updatedTopics[index], [field]: value };
    
    // Auto-generate slug for topics
    if (field === 'title' && value) {
      updatedTopics[index].slug = slugify(value);
    }
    
    setTopics(updatedTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare topics data for submission
    const topicsData: CreateTopicInput[] = topics
      .filter(topic => topic.title.trim() && topic.slug.trim())
      .map(topic => ({
        title: topic.title.trim(),
        slug: topic.slug.trim(),
        description: topic.description?.trim() || null,
        categoryId: category?.id || "", // Will be set by backend for new categories
      }));

    try {
      await onSubmit({
        ...formData,
        topics: topicsData,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Category Name *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name"
          className={errors.name ? "border-red-500" : ""}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Category Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-2">
          Category Slug *
        </label>
        <div className="flex items-center space-x-2">
          <Input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => {
              setFormData({ ...formData, slug: e.target.value });
              setAutoSlug(false); // Disable auto-generation when manually edited
            }}
            placeholder="category-slug"
            className={errors.slug ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {!category && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAutoSlug(true);
                setFormData(prev => ({
                  ...prev,
                  slug: slugify(formData.name)
                }));
              }}
              disabled={!formData.name || isLoading}
            >
              Auto
            </Button>
          )}
        </div>
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional description for this category"
          disabled={isLoading}
        />
      </div>

      {/* Topics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-slate-700">
            Topics (optional)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTopic}
            disabled={isLoading}
          >
            + Add Topic
          </Button>
        </div>
        
        {topics.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No topics added yet. Topics help organize articles within this category.
          </p>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-700">Topic {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTopic(index)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Topic Title *
                    </label>
                    <Input
                      type="text"
                      value={topic.title}
                      onChange={(e) => updateTopic(index, 'title', e.target.value)}
                      placeholder="e.g., Markets, Technology"
                      disabled={isLoading}
                      size="sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Topic Slug *
                    </label>
                    <Input
                      type="text"
                      value={topic.slug}
                      onChange={(e) => updateTopic(index, 'slug', e.target.value)}
                      placeholder="e.g., markets, technology"
                      disabled={isLoading}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={topic.description || ""}
                    onChange={(e) => updateTopic(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of this topic"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
