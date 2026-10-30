export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface PageQuery {
  page: number;
  size: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginationProps {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}
