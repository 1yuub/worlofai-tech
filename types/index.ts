export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  sourceName: string;
  category: Category;
  publishedAt: string;
  author?: string;
  tags?: string[];
  readTime?: number;
}

export type Category =
  | 'tech'
  | 'ai'
  | 'crypto'
  | 'dev'
  | 'market'
  | 'general';

export interface NewsApiResponse {
  articles: Article[];
  totalResults: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchParams {
  q?: string;
  category?: Category;
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'relevance';
}

export type Theme = 'light' | 'dark';
