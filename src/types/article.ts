// @/types/article.ts

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleContentJson {
  time: number;
  blocks: Array<{
    id: string;
    type: string;
    data: Record<string, any>;
    tunes?: {
      highlight?: {
        highlighted: boolean;
      };
    };
  }>;
  version: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  contentJson: ArticleContentJson;
  excerpt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  authorName: string | null;
  category: ArticleCategory;
  topic: string;
}