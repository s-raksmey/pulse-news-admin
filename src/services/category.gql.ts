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

// Fallback query that tries to include topics but may fail if schema doesn't support it
export const Q_CATEGORIES_WITH_TOPICS_FALLBACK = gql`
  query GetCategoriesWithTopicsFallback {
    categories {
      id
      name
      slug
      createdAt
      updatedAt
      topics {
        id
        slug
        title
        createdAt
        updatedAt
      }
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
  query GetTopicsByCategory($categorySlug: String!) {
    topicsByCategory(categorySlug: $categorySlug) {
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

// Fallback mutation without description field for schema compatibility
export const M_CREATE_CATEGORY_BASIC = gql`
  mutation CreateCategoryBasic($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
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

// Fallback mutation without description field for schema compatibility
export const M_UPDATE_CATEGORY_BASIC = gql`
  mutation UpdateCategoryBasic($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
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
      console.error('Error fetching categories with topics (full query):', error);
      
      // Enhanced error detection - check multiple possible error structures
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || '';
      const errorString = JSON.stringify(error);
      
      // Check if the error is due to missing schema fields (multiple ways to detect)
      const isSchemaFieldError = 
        errorMessage.includes('Cannot query field "description"') || 
        errorMessage.includes('Cannot query field "topics"') ||
        errorString.includes('Cannot query field "description"') ||
        errorString.includes('Cannot query field "topics"') ||
        (error?.response?.errors && error.response.errors.some((err: any) => 
          err.message?.includes('Cannot query field "description"') || 
          err.message?.includes('Cannot query field "topics"')
        ));
      
      if (isSchemaFieldError) {
        console.warn('🔄 Backend schema missing description field. Trying fallback query with topics but no description...');
        
        // Try fallback query with topics but no description
        try {
          const fallbackResponse = await this.client.request<{ categories: Category[] }>(
            Q_CATEGORIES_WITH_TOPICS_FALLBACK
          );
          console.info('✅ Successfully loaded categories with topics using fallback query (without description)');
          return fallbackResponse.categories;
        } catch (fallbackError: any) {
          console.warn('🔄 Fallback query with topics also failed. Trying basic categories query...');
          
          // Final fallback to basic categories query
          try {
            const basicResponse = await this.client.request<{ categories: Category[] }>(
              Q_CATEGORIES
            );
            console.info('⚠️ Successfully loaded categories using basic query (without descriptions/topics)');
            console.warn('💡 Topics will not be displayed. To enable full functionality, restart your backend server or check GraphQL schema compilation.');
            return basicResponse.categories;
          } catch (basicError) {
            console.error('❌ All fallback queries failed:', basicError);
            throw new Error('Failed to fetch categories. Please check your backend configuration and ensure the GraphQL server is running.');
          }
        }
      }
      
      // Re-throw other errors with more context
      console.error('❌ Non-schema related error occurred:', errorMessage);
      throw new Error(`Failed to fetch categories: ${errorMessage}`);
    }
  }

  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    try {
      // Try the full mutation with description field first
      const response = await this.client.request<{ createCategory: Category }>(
        M_CREATE_CATEGORY,
        { input }
      );
      return response.createCategory;
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Extract GraphQL error message if available
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to create category';
      const errorString = JSON.stringify(error);
      
      // Check if the error is due to missing description field in response
      const isSchemaFieldError = 
        errorMessage.includes('Cannot query field "description"') ||
        errorString.includes('Cannot query field "description"') ||
        (error?.response?.errors && error.response.errors.some((err: any) => 
          err.message?.includes('Cannot query field "description"')
        ));
      
      if (isSchemaFieldError) {
        console.warn('🔄 Backend schema missing description field in response. Trying basic mutation...');
        
        // Fallback to basic mutation without description field
        try {
          const fallbackResponse = await this.client.request<{ createCategory: Category }>(
            M_CREATE_CATEGORY_BASIC,
            { input }
          );
          console.info('✅ Successfully created category using basic mutation (without description in response)');
          return fallbackResponse.createCategory;
        } catch (fallbackError: any) {
          console.error('❌ Fallback mutation also failed:', fallbackError);
          const fallbackErrorMessage = fallbackError?.response?.errors?.[0]?.message || fallbackError?.message || 'Failed to create category';
          throw new Error(`Failed to create category: ${fallbackErrorMessage}`);
        }
      }
      
      // Provide helpful guidance for other common issues
      if (errorMessage.includes('Field "description" is not defined')) {
        throw new Error('Backend GraphQL schema needs to be updated to support the description field. Please restart your backend server.');
      }
      
      throw new Error(errorMessage);
    }
  }

  static async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    try {
      // Try the full mutation with description field first
      const response = await this.client.request<{ updateCategory: Category }>(
        M_UPDATE_CATEGORY,
        { id, input }
      );
      return response.updateCategory;
    } catch (error: any) {
      console.error('Error updating category:', error);
      
      // Extract GraphQL error message if available
      const errorMessage = error?.response?.errors?.[0]?.message || error?.message || 'Failed to update category';
      const errorString = JSON.stringify(error);
      
      // Check if the error is due to missing description field in response
      const isSchemaFieldError = 
        errorMessage.includes('Cannot query field "description"') ||
        errorString.includes('Cannot query field "description"') ||
        (error?.response?.errors && error.response.errors.some((err: any) => 
          err.message?.includes('Cannot query field "description"')
        ));
      
      if (isSchemaFieldError) {
        console.warn('🔄 Backend schema missing description field in response. Trying basic mutation...');
        
        // Fallback to basic mutation without description field
        try {
          const fallbackResponse = await this.client.request<{ updateCategory: Category }>(
            M_UPDATE_CATEGORY_BASIC,
            { id, input }
          );
          console.info('✅ Successfully updated category using basic mutation (without description in response)');
          return fallbackResponse.updateCategory;
        } catch (fallbackError: any) {
          console.error('❌ Fallback mutation also failed:', fallbackError);
          const fallbackErrorMessage = fallbackError?.response?.errors?.[0]?.message || fallbackError?.message || 'Failed to update category';
          throw new Error(`Failed to update category: ${fallbackErrorMessage}`);
        }
      }
      
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
  static async getTopicsByCategory(categorySlug: string): Promise<Topic[]> {
    try {
      const response = await this.client.request<{ topicsByCategory: Topic[] }>(
        Q_TOPICS_BY_CATEGORY,
        { categorySlug }
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
