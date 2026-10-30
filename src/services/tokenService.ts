import type { User } from '@/types/user.types';
import { CHAVE_REFRESH_TOKEN, CHAVE_SESSAO, CHAVE_TOKEN } from '@/utils/chaves';
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

let versaoSessao = 0;

export function limparTokens(): void {
  versaoSessao++;
  promessaRenovacaoEmAndamento = null;
  removerArmazenado(CHAVE_TOKEN);
  removerArmazenado(CHAVE_REFRESH_TOKEN);
}

/**
 * Verifica se um JWT está expirado ou prestes a expirar dentro de uma margem em segundos.
 */
export function isTokenExpirado(token?: string | null, margemSegundos = 30): boolean {
  const tokenAlvo = token ?? obterAccessToken();
  if (!tokenAlvo) return true;

  const claims = parseJwt(tokenAlvo);
  if (!claims || typeof claims.exp !== 'number') return false;

  const agora = Math.floor(Date.now() / 1000);
  return agora >= claims.exp - margemSegundos;
}

/**
 * Notifica que a sessão expirou, limpando os dados persistidos e disparando evento global.
 */
export function notificarSessaoExpirada(): void {
  limparTokens();
  removerArmazenado(CHAVE_SESSAO);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:session_expired'));
  }
}

// Mutex para evitar que múltiplas requisições paralelas disparem múltiplos refreshes
let promessaRenovacaoEmAndamento: Promise<string | null> | null = null;

/**
 * Executa a renovação do token via refresh_token com controle de concorrência.
 * Retorna o novo access_token gerado ou null se a renovação falhar.
 */
export async function executarRenovacaoToken(): Promise<string | null> {
  if (promessaRenovacaoEmAndamento) {
    return promessaRenovacaoEmAndamento;
  }

  const versaoAtual = versaoSessao;

  const promessa = (async () => {
    const refreshToken = obterRefreshToken();
    if (!refreshToken) {
      notificarSessaoExpirada();
      return null;
    }

    try {
      const { renovarToken } = await import('./authService');
      const response = await renovarToken(refreshToken);

      if (versaoAtual !== versaoSessao) {
        return null;
      }

      salvarTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });

      // Atualiza a sessão persistida do usuário se existir
      const sessaoAtual = lerArmazenado<User>(CHAVE_SESSAO);
      if (sessaoAtual && versaoAtual === versaoSessao) {
        salvarArmazenado(CHAVE_SESSAO, {
          ...sessaoAtual,
          token: response.access_token,
          refreshToken: response.refresh_token || sessaoAtual.refreshToken,
        });
      }

      // Notifica as abas e componentes sobre o novo token
      if (typeof window !== 'undefined' && versaoAtual === versaoSessao) {
        window.dispatchEvent(
          new CustomEvent('auth:token_refreshed', {
            detail: {
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
            },
          }),
        );
      }

      return response.access_token;
    } catch (error: unknown) {
      if (versaoAtual !== versaoSessao) {
        return null;
      }
      const { ServiceError } = await import('./authService');
      if (error instanceof ServiceError && error.status && error.status !== 400 && error.status !== 401 && error.status !== 403) {
        return null;
      }
      notificarSessaoExpirada();
      return null;
    }
  })();

  promessaRenovacaoEmAndamento = promessa;
  void promessa.finally(() => {
    if (promessaRenovacaoEmAndamento === promessa) {
      promessaRenovacaoEmAndamento = null;
    }
  });

  return promessa;
}
