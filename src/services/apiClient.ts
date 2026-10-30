import { API_URL } from '@/utils/constants';
import type { ApiResponse } from '@/types/api.types';
import {
  executarRenovacaoToken,
  isTokenExpirado,
  obterAccessToken,
  obterRefreshToken,
} from './tokenService';

export class ApiRequestError extends Error {
  constructor(readonly status: number) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiRequestError';
  }
}

/**
 * Wrapper de fetch com injeção de Bearer Token e renovação automática via refresh_token.
 * - Antes da requisição: se o token existir e estiver expirado/quase expirando, renova preventivamente.
 * - Em caso de 401 Unauthorized: renova o token e reexecuta a requisição original com o novo token.
 */
export async function fetchComAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let token = obterAccessToken();
  const refreshToken = obterRefreshToken();

  const urlString =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  const isAuthEndpoint =
    urlString.includes('/v1/auth/token/refresh') ||
    urlString.includes('/v1/auth/login');

  // Verificação proativa: se o token expirou e temos refresh_token, renova antes do envio
  if (!isAuthEndpoint && token && refreshToken && isTokenExpirado(token)) {
    const novoToken = await executarRenovacaoToken();
    if (novoToken) {
      token = novoToken;
    }
  }

  const aplicarHeaders = (tok: string | null): Headers => {
    const headers = new Headers(init?.headers);
    if (tok && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${tok}`);
    }
    return headers;
  };

  const response = await fetch(input, {
    ...init,
    headers: aplicarHeaders(token),
  });

  // Se receber 401 e tivermos refresh_token, tenta renovar e repetir a requisição
  if (response.status === 401 && !isAuthEndpoint && refreshToken) {
    const novoToken = await executarRenovacaoToken();
    if (novoToken) {
      return fetch(input, {
        ...init,
        headers: aplicarHeaders(novoToken),
      });
    }
  }

  return response;
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetchComAuth(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }

  return res.json() as Promise<ApiResponse<T>>;
}
