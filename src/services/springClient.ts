import { SPRING_API_URL } from '@/utils/constants';
import { fetchComAuth } from './apiClient';
import { ServiceError } from './authService';

type Query = Record<string, string | number | boolean | null | undefined>;

export interface SpringRequestInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

interface SpringErrorBody {
  detail?: string;
  message?: string;
  title?: string;
  errors?: Array<{ message?: string; defaultMessage?: string }>;
}

function montarUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([chave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') params.set(chave, String(valor));
  });
  const qs = params.toString();
  return `${SPRING_API_URL}${path}${qs ? `?${qs}` : ''}`;
}

async function mensagemDeErro(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) return 'Sessão expirada. Faça login novamente.';
  if (res.status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (res.status === 503 || res.status === 502) return 'Serviço indisponível no momento. Tente novamente.';
  const corpo = (await res.json().catch(() => null)) as SpringErrorBody | null;
  const detalhe = corpo?.errors?.[0]?.defaultMessage ?? corpo?.errors?.[0]?.message;
  return detalhe ?? corpo?.detail ?? corpo?.message ?? fallback;
}

/**
 * Cliente do ms-spring-api: injeta o Bearer (com refresh automático via fetchComAuth),
 * serializa JSON e converte falhas HTTP em ServiceError com mensagem legível.
 */
export async function springRequest<T>(
  path: string,
  { method = 'GET', body, query, signal }: SpringRequestInit = {},
  fallbackErro = 'Não foi possível concluir a operação.',
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  let res: Response;
  try {
    res = await fetchComAuth(montarUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ServiceError('Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (!res.ok) {
    throw new ServiceError(await mensagemDeErro(res, fallbackErro));
  }
  if (res.status === 204) return undefined as T;
  const texto = await res.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}
