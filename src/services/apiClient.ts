import { API_URL } from '@/utils/constants';
import type { ApiResponse } from '@/types/api.types';
import type { User } from '@/types/user.types';
import { CHAVE_SESSAO } from '@/utils/chaves';
import { lerArmazenado } from '@/utils/storage';

export class ApiRequestError extends Error{
  readonly status: number;

  constructor(status: number){
    super(`API request failed with status ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function tokenDaSessao(): string | undefined{
  return lerArmazenado<User>(CHAVE_SESSAO)?.token;
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>>{
  const token = tokenDaSessao();

  const res = await fetch(`${API_URL}${path}`,{
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new ApiRequestError(res.status);
  }

  return res.json() as Promise<ApiResponse<T>>;
}
