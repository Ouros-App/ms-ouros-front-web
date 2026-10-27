import type {
  KeycloakTokenResponse,
  LoginValues,
  NativeLoginStartResponse,
} from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { CHAVE_PERFIS } from '@/utils/chaves';
import { AUTH_API_URL } from '@/utils/constants';
import { isAbortError, wait } from '@/utils/delay';
import { lerArmazenado } from '@/utils/storage';
import { claimsToUser } from './tokenService';

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

interface UsuarioCadastrado extends User {
  password?: string;
}

interface PerfilSalvo {
  id: string;
  nome: string;
  avatarUrl: string | null;
}

function aplicarPerfisSalvos(lista: UsuarioCadastrado[]): UsuarioCadastrado[] {
  const salvos = lerArmazenado<PerfilSalvo[]>(CHAVE_PERFIS);
  if (!salvos) return lista;
  return lista.map((usuario) => {
    const salvo = salvos.find((perfil) => perfil.id === usuario.id);
    return salvo
      ? { ...usuario, name: salvo.nome, avatarUrl: salvo.avatarUrl ?? undefined }
      : usuario;
  });
}

const usuarios: UsuarioCadastrado[] = aplicarPerfisSalvos([
  {
    id: 'u-1',
    name: 'Vera Marcelinha',
    email: 'gestor@ouros.com',
    password: 'ouros123',
    role: 'admin',
    accountType: 'admin',
    databaseId: 1,
  },
]);

export function atualizarUsuarioCadastrado(
  id: string,
  dados: { name: string; avatarUrl?: string; password?: string },
): void {
  const usuario = usuarios.find((u) => u.id === id);

  if (!usuario) throw new ServiceError('Usuário não encontrado.');
  usuario.name = dados.name;
  usuario.avatarUrl = dados.avatarUrl;
  if (dados.password) usuario.password = dados.password;
}

function toServiceError(error: unknown, fallback: string): Error {
  if (isAbortError(error) && error instanceof Error) return error;
  if (error instanceof ServiceError) return error;
  return new ServiceError(fallback);
}

export function mascaraEmail(email: string): string {
  const [usuario, dominio] = email.split('@');
  if (!usuario || !dominio) return email;
  const primeiraLetra = usuario[0] ?? '';
  return `${primeiraLetra}***@${dominio}`;
}

function criarMockJwt(payload: Record<string, unknown>): string {
  const base64UrlEncode = (str: string) =>
    btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.mockSignature`;
}

/**
 * Etapa 1: Início do Login e Envio de OTP via ms-auth-service
 * POST /v1/auth/login/start
 */
export async function iniciarLogin(
  dados: LoginValues,
  signal?: AbortSignal,
): Promise<NativeLoginStartResponse> {
  const emailLimpo = dados.email.trim().toLowerCase();

  try {
    const url = `${AUTH_API_URL}/v1/auth/login/start`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailLimpo,
        password: dados.password,
      }),
      signal,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new ServiceError('E-mail ou senha incorretos.');
      }
      if (res.status === 429) {
        throw new ServiceError(
          'Muitas tentativas de login. Aguarde alguns instantes antes de tentar novamente.',
        );
      }
      if (res.status === 503) {
        throw new ServiceError(
          'Serviço de envio de e-mail ou autenticação temporariamente indisponível.',
        );
      }
      const errorData = await res.json().catch(() => null);
      throw new ServiceError(
        errorData?.detail || 'Não foi possível iniciar o login. Tente novamente.',
      );
    }

    return (await res.json()) as NativeLoginStartResponse;
  } catch (error) {
    if (isAbortError(error)) throw error;
    if (error instanceof ServiceError) throw error;

    // Fallback de desenvolvimento caso o backend ms-auth-service esteja offline
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      const cadastrado = usuarios.find(
        (u) => u.email === emailLimpo && u.password === dados.password,
      );
      if (cadastrado) {
        await wait(500, signal);
        return {
          challenge_id: `mock-challenge-${Date.now()}`,
          expires_in: 300,
          masked_email: mascaraEmail(emailLimpo),
        };
      }
      if (dados.password.length >= 6) {
        await wait(500, signal);
        return {
          challenge_id: `mock-challenge-${Date.now()}`,
          expires_in: 300,
          masked_email: mascaraEmail(emailLimpo),
        };
      }
    }

    throw toServiceError(error, 'Serviço de autenticação indisponível. Verifique sua conexão.');
  }
}

/**
 * Etapa 2: Validação do Código e Emissão de Tokens
 * POST /v1/auth/login/verify
 */
export async function verificarCodigoLogin(
  dados: {
    email: string;
    password: string;
    challengeId: string;
    code: string;
  },
  signal?: AbortSignal,
): Promise<KeycloakTokenResponse> {
  const emailLimpo = dados.email.trim().toLowerCase();

  try {
    const url = `${AUTH_API_URL}/v1/auth/login/verify`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailLimpo,
        password: dados.password,
        challenge_id: dados.challengeId,
        code: dados.code.trim(),
      }),
      signal,
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new ServiceError('Código de verificação incorreto, expirado ou desafio cancelado.');
      }
      if (res.status === 429) {
        throw new ServiceError(
          'Limite de tentativas excedido. Solicite um novo código por e-mail.',
        );
      }
      const errorData = await res.json().catch(() => null);
      throw new ServiceError(
        errorData?.detail || 'Não foi possível validar o código. Tente novamente.',
      );
    }

    return (await res.json()) as KeycloakTokenResponse;
  } catch (error) {
    if (isAbortError(error)) throw error;
    if (error instanceof ServiceError) throw error;

    // Fallback de desenvolvimento caso o backend ms-auth-service esteja offline
    if (dados.challengeId.startsWith('mock-challenge-')) {
      await wait(500, signal);
      // No ambiente simulado, aceitamos '123456' ou qualquer código de 6 dígitos que não termine em 00
      if (dados.code !== '123456' && dados.code.endsWith('00')) {
        throw new ServiceError('Código incorreto. Use 123456 no ambiente de demonstração.');
      }

      const cadastrado = usuarios.find((u) => u.email === emailLimpo);
      const mockClaims = {
        sub: cadastrado?.id || 'u-demo',
        database_id: cadastrado?.databaseId || 1,
        email: emailLimpo,
        name: cadastrado?.name || 'Vera Marcelinha',
        account_type: cadastrado?.role || 'admin',
        roles: ['admin', 'user'],
        realm_access: { roles: ['admin'] },
        exp: Math.floor(Date.now() / 1000) + 300,
      };

      const mockToken = criarMockJwt(mockClaims);
      const mockRefresh = criarMockJwt({ ...mockClaims, typ: 'Refresh' });

      return {
        access_token: mockToken,
        refresh_token: mockRefresh,
        expires_in: 300,
        refresh_expires_in: 1800,
        token_type: 'Bearer',
        scope: 'openid ouros-identity offline_access',
      };
    }

    throw toServiceError(error, 'Não foi possível validar o código. Tente novamente.');
  }
}

/**
 * Renovação de Sessão via refresh_token
 * POST /v1/auth/token/refresh
 */
export async function renovarToken(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<KeycloakTokenResponse> {
  const url = `${AUTH_API_URL}/v1/auth/token/refresh`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
    signal,
  });

  if (!res.ok) {
    throw new ServiceError('Sessão expirada. Faça login novamente.');
  }

  return (await res.json()) as KeycloakTokenResponse;
}

/**
 * Compatibilidade legada para autenticação direta síncrona
 */
export async function entrar(values: LoginValues, signal?: AbortSignal): Promise<User> {
  try {
    await wait(600, signal);
    const email = values.email.trim().toLowerCase();
    const encontrado = usuarios.find((u) => u.email === email && u.password === values.password);

    if (!encontrado) {
      throw new ServiceError('E-mail ou senha incorretos.');
    }

    const mockClaims = {
      sub: encontrado.id,
      database_id: encontrado.databaseId || 1,
      email: encontrado.email,
      name: encontrado.name,
      account_type: encontrado.role,
      roles: [encontrado.role],
    };
    const mockToken = criarMockJwt(mockClaims);

    return claimsToUser(mockClaims, mockToken);
  } catch (error) {
    throw toServiceError(error, 'Não foi possível entrar. Tente novamente.');
  }
}

export async function entrarComGoogle(signal?: AbortSignal): Promise<User> {
  try {
    await wait(500, signal);
    throw new ServiceError(
      'O login com Google ainda não está disponível. Use seu e-mail e senha.',
    );
  } catch (error) {
    throw toServiceError(error, 'Não foi possível entrar com o Google.');
  }
}
