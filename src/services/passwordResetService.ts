import { AUTH_API_URL } from '@/utils/constants';
import { ServiceError } from './authService';

export interface PasswordResetStartResponse {
  challenge_id: string;
  masked_email: string;
  expires_in: number;
}

export interface PasswordResetVerifyResponse {
  reset_token: string;
  expires_in: number;
}

interface ErroApi {
  detail?: string | Array<{ msg?: string }>;
  offline?: boolean;
}

async function post<T>(caminho: string, corpo: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_API_URL}/v1/auth/password/reset/${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ServiceError('Não foi possível conectar ao servidor. Tente novamente.');
  }

  if (res.ok) return (await res.json()) as T;

  if (res.status === 429) {
    throw new ServiceError('Muitas tentativas. Aguarde alguns instantes antes de tentar novamente.');
  }
  const erro = (await res.json().catch(() => null)) as ErroApi | null;
  if (res.status >= 500 || erro?.offline) {
    throw new ServiceError('Serviço de autenticação indisponível no momento. Tente novamente.');
  }
  const detalhe = Array.isArray(erro?.detail) ? erro?.detail[0]?.msg : erro?.detail;
  throw new ServiceError(detalhe ?? 'Não foi possível concluir a solicitação.');
}

/** Etapa 1: envia o OTP por e-mail (POST /v1/auth/password/reset/start). */
export function iniciarRedefinicaoSenha(email: string, signal?: AbortSignal) {
  return post<PasswordResetStartResponse>('start', { email: email.trim().toLowerCase() }, signal);
}

/** Etapa 2: valida o OTP de 6 dígitos e recebe o reset_token efêmero (POST .../verify). */
export function verificarCodigoRedefinicao(
  dados: { challengeId: string; email: string; code: string },
  signal?: AbortSignal,
) {
  return post<PasswordResetVerifyResponse>(
    'verify',
    { challenge_id: dados.challengeId, email: dados.email.trim().toLowerCase(), code: dados.code },
    signal,
  );
}

/** Etapa 3: define a nova senha com o reset_token (POST .../confirm). */
export function confirmarRedefinicaoSenha(
  dados: { resetToken: string; novaSenha: string },
  signal?: AbortSignal,
) {
  return post<{ message: string }>(
    'confirm',
    { reset_token: dados.resetToken, new_password: dados.novaSenha },
    signal,
  );
}

/** Regra do ms-auth-service: 8–20 caracteres com maiúscula, minúscula, número e caractere especial. */
export const REGRA_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,20}$/;
