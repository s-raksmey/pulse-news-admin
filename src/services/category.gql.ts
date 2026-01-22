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
      description
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

export const M_CREATE_TOPIC = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
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

export const M_UPDATE_TOPIC = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
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
  topics?: CreateTopicInput[];
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface CreateTopicInput {
  slug: string;
  title: string;
  description?: string | null;
  categoryId: string;
}

export interface UpdateTopicInput {
  slug?: string;
  title?: string;
  description?: string | null;
  categoryId?: string;
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
      const response = await this.client.request<{ categories: Category[] }>(
        Q_CATEGORIES_WITH_TOPICS
      );
      return response.categories;
    } catch (error) {
      console.error('Error fetching categories with topics:', error);
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
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  static async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    try {
      const response = await this.client.request<{ updateCategory: Category }>(
        M_UPDATE_CATEGORY,
        { id, input }
      );
      return response.updateCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      await this.client.request(M_DELETE_CATEGORY, { id });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
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
    } catch (error) {
      console.error('Error fetching topics by category:', error);
      throw new Error('Failed to fetch topics');
    }
  }

  static async createTopic(input: CreateTopicInput): Promise<Topic> {
    try {
      const response = await this.client.request<{ createTopic: Topic }>(
        M_CREATE_TOPIC,
        { input }
      );
      return response.createTopic;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw new Error('Failed to create topic');
    }
  }

  static async updateTopic(id: string, input: UpdateTopicInput): Promise<Topic> {
    try {
      const response = await this.client.request<{ updateTopic: Topic }>(
        M_UPDATE_TOPIC,
        { id, input }
      );
      return response.updateTopic;
    } catch (error) {
      console.error('Error updating topic:', error);
      throw new Error('Failed to update topic');
    }
  }

  static async deleteTopic(id: string): Promise<void> {
    try {
      await this.client.request(M_DELETE_TOPIC, { id });
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw new Error('Failed to delete topic');
    }
  }
}
