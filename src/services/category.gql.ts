import { gql } from "graphql-request";
import { getAuthenticatedGqlClient } from "./graphql-client";

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export const Q_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;

export const Q_CATEGORIES_WITH_TOPICS = gql`
  query GetCategoriesWithTopics {
    categories {
      id
      name
      slug
      description
      createdAt
      updatedAt
      topics {
        id
        slug
        title
        description
        createdAt
        updatedAt
      }
    }
  }
`;

export const Q_TOPICS_BY_CATEGORY = gql`
  query GetTopicsByCategory($categoryId: ID!) {
    topicsByCategory(categoryId: $categoryId) {
      id
      slug
      title
      description
      categoryId
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// CATEGORY MUTATIONS
// ============================================================================

export const M_CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`;

export const M_UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`;

export const M_DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

// ============================================================================
// TOPIC MUTATIONS
// ============================================================================

export const M_UPSERT_TOPIC = gql`
  mutation UpsertTopic($input: UpsertTopicInput!) {
    upsertTopic(input: $input) {
      id
      slug
      title
      description
      categoryId
      createdAt
      updatedAt
    }
  }
`;

export const M_DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface UpsertTopicInput {
  slug: string;
  title: string;
  description?: string | null;
  categoryId: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class CategoryService {
  private static client = getAuthenticatedGqlClient();

  // Category Methods
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await this.client.request<{ categories: Category[] }>(
        Q_CATEGORIES
      );
      return response.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  static async getCategoriesWithTopics(): Promise<Category[]> {
    try {
      // Try the full query with description and topics fields first
      const response = await this.client.request<{ categories: Category[] }>(
        Q_CATEGORIES_WITH_TOPICS
      );
      return response.categories;
    } catch (error: any) {
      console.error('Error fetching categories with topics:', error);
      
      // Check if the error is due to missing schema fields
      const errorMessage = error?.response?.errors?.[0]?.message || '';
      if (errorMessage.includes('Cannot query field "description"') || 
          errorMessage.includes('Cannot query field "topics"')) {
        
        console.warn('Backend schema missing description/topics fields. Falling back to basic categories query.');
        console.warn('Please run database migrations: npx prisma migrate deploy');
        
        // Fallback to basic categories query
        try {
          const fallbackResponse = await this.client.request<{ categories: Category[] }>(
            Q_CATEGORIES
          );
          return fallbackResponse.categories;
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw new Error('Failed to fetch categories. Please check your backend configuration.');
        }
      }
      
      // Re-throw other errors
      throw new Error('Failed to fetch categories with topics');
    }
  }

  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    try {
      const response = await this.client.request<{ createCategory: Category }>(
        M_CREATE_CATEGORY,
        { input }
      );
      return response.createCategory;
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Extract GraphQL error message if available
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to create category';
      
      // Provide helpful guidance for common issues
      if (errorMessage.includes('Cannot query field "description"')) {
        throw new Error('Backend schema is missing the description field. Please run database migrations: npx prisma migrate deploy');
      }
      
      if (errorMessage.includes('Field "description" is not defined')) {
        throw new Error('Backend GraphQL schema needs to be updated to support the description field. Please check your backend configuration.');
      }
      
      throw new Error(errorMessage);
    }
  }

  static async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    try {
      const response = await this.client.request<{ updateCategory: Category }>(
        M_UPDATE_CATEGORY,
        { id, input }
      );
      return response.updateCategory;
    } catch (error: any) {
      console.error('Error updating category:', error);
      // Extract GraphQL error message if available
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to update category';
      throw new Error(errorMessage);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      await this.client.request<{ deleteCategory: boolean }>(
        M_DELETE_CATEGORY,
        { id }
      );
    } catch (error: any) {
      console.error('Error deleting category:', error);
      // Extract GraphQL error message if available
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to delete category';
      throw new Error(errorMessage);
    }
  }

  // Topic Methods
  static async getTopicsByCategory(categoryId: string): Promise<Topic[]> {
    try {
      const response = await this.client.request<{ topicsByCategory: Topic[] }>(
        Q_TOPICS_BY_CATEGORY,
        { categoryId }
      );
      return response.topicsByCategory;
    } catch (error: any) {
      console.error('Error fetching topics by category:', error);
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to fetch topics';
      throw new Error(errorMessage);
    }
  }

  static async upsertTopic(input: UpsertTopicInput): Promise<Topic> {
    try {
      const response = await this.client.request<{ upsertTopic: Topic }>(
        M_UPSERT_TOPIC,
        { input }
      );
      return response.upsertTopic;
    } catch (error: any) {
      console.error('Error upserting topic:', error);
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to save topic';
      throw new Error(errorMessage);
    }
  }

  // Convenience methods for create/update
  static async createTopic(input: UpsertTopicInput): Promise<Topic> {
    return this.upsertTopic(input);
  }

  static async updateTopic(input: UpsertTopicInput): Promise<Topic> {
    return this.upsertTopic(input);
  }

  static async deleteTopic(id: string): Promise<void> {
    try {
      await this.client.request<{ deleteTopic: boolean }>(
        M_DELETE_TOPIC,
        { id }
      );
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to delete topic';
      throw new Error(errorMessage);
    }
  }
}
