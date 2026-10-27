import type { User } from '@/types/user.types';
import { CHAVE_REFRESH_TOKEN, CHAVE_TOKEN } from '@/utils/chaves';
import { lerArmazenado, removerArmazenado, salvarArmazenado } from '@/utils/storage';

export interface KeycloakTokenClaims {
  sub?: string;
  database_id?: number | string;
  email?: string;
  name?: string;
  preferred_username?: string;
  account_type?: 'farm_owner' | 'company_employee' | 'admin' | string;
  roles?: string[];
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodifica o payload de um JWT de forma segura no navegador.
 */
export function parseJwt<T = KeycloakTokenClaims>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Converte os claims Keycloak no formato User esperado pela aplicação.
 */
export function claimsToUser(
  claims: KeycloakTokenClaims,
  accessToken?: string,
  refreshToken?: string,
): User {
  const id = claims.sub || (claims.database_id !== undefined ? String(claims.database_id) : 'u-user');
  const name =
    claims.name ||
    claims.preferred_username ||
    (claims.email ? claims.email.split('@')[0] : 'Usuário');
  const email = claims.email || '';

  const isAdmin =
    claims.account_type === 'admin' ||
    claims.realm_access?.roles?.includes('admin') ||
    claims.roles?.includes('admin');

  const role = isAdmin
    ? 'admin'
    : claims.account_type || 'user';

  const databaseId =
    typeof claims.database_id === 'number'
      ? claims.database_id
      : typeof claims.database_id === 'string'
        ? Number.parseInt(claims.database_id, 10)
        : undefined;

  return {
    id,
    name,
    email,
    role,
    databaseId: Number.isNaN(databaseId) ? undefined : databaseId,
    accountType: claims.account_type,
    token: accessToken,
    refreshToken,
  };
}

export function salvarTokens(tokens: { accessToken: string; refreshToken?: string }): void {
  salvarArmazenado(CHAVE_TOKEN, tokens.accessToken);
  if (tokens.refreshToken) {
    salvarArmazenado(CHAVE_REFRESH_TOKEN, tokens.refreshToken);
  }
}

export function obterAccessToken(): string | null {
  return lerArmazenado<string>(CHAVE_TOKEN);
}

export function obterRefreshToken(): string | null {
  return lerArmazenado<string>(CHAVE_REFRESH_TOKEN);
}

export function limparTokens(): void {
  removerArmazenado(CHAVE_TOKEN);
  removerArmazenado(CHAVE_REFRESH_TOKEN);
}
