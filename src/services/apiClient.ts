import { API_URL } from '@/utils/constants';
import type { ApiResponse } from '@/types/api.types';
import { obterAccessToken } from './tokenService';

export async function apiClient<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = obterAccessToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }

  return res.json() as Promise<ApiResponse<T>>;
}
