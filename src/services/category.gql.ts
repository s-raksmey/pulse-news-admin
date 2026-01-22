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
      // Fallback to basic categories query until backend supports description and topics fields
      const response = await this.client.request<{ categories: Category[] }>(
        Q_CATEGORIES
      );
      return response.categories;
    } catch (error) {
      console.error('Error fetching categories with topics:', error);
      throw new Error('Failed to fetch categories with topics');
    }
  }

  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    // TODO: Backend doesn't support createCategory mutation yet
    // This is a temporary implementation that throws a user-friendly error
    throw new Error('Category creation is not yet supported by the backend. Please contact your development team to implement the createCategory GraphQL mutation.');
  }

  static async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    // TODO: Backend doesn't support updateCategory mutation yet
    // This is a temporary implementation that throws a user-friendly error
    throw new Error('Category editing is not yet supported by the backend. Please contact your development team to implement the updateCategory GraphQL mutation.');
  }

  static async deleteCategory(id: string): Promise<void> {
    // TODO: Backend doesn't support deleteCategory mutation yet
    // This is a temporary implementation that throws a user-friendly error
    throw new Error('Category deletion is not yet supported by the backend. Please contact your development team to implement the deleteCategory GraphQL mutation.');
  }

  // Topic Methods - TODO: Backend doesn't support topic operations yet
  static async getTopicsByCategory(categoryId: string): Promise<Topic[]> {
    // TODO: Backend doesn't support topicsByCategory query yet
    throw new Error('Topic queries are not yet supported by the backend. Please contact your development team to implement topic-related GraphQL operations.');
  }

  static async createTopic(input: CreateTopicInput): Promise<Topic> {
    // TODO: Backend doesn't support createTopic mutation yet
    throw new Error('Topic creation is not yet supported by the backend. Please contact your development team to implement the createTopic GraphQL mutation.');
  }

  static async updateTopic(id: string, input: UpdateTopicInput): Promise<Topic> {
    // TODO: Backend doesn't support updateTopic mutation yet
    throw new Error('Topic editing is not yet supported by the backend. Please contact your development team to implement the updateTopic GraphQL mutation.');
  }

  static async deleteTopic(id: string): Promise<void> {
    // TODO: Backend doesn't support deleteTopic mutation yet
    throw new Error('Topic deletion is not yet supported by the backend. Please contact your development team to implement the deleteTopic GraphQL mutation.');
  }
}
