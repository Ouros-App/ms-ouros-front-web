import { apiClient } from './apiClient';
import type { Product } from '@/types/product.types';

export const productService = {
  list: () => apiClient<Product[]>('/products'),
  detail: (id: string) => apiClient<Product>(`/products/${id}`),
};
