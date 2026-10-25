export interface Paged<T> {
  items: T[];
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
}

export interface ActionNeededItem {
  module: string;
  type: string;
  title: string;
  description: string;
  link: string | null;
  priority: number;
}
