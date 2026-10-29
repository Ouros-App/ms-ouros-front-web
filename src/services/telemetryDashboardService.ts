import type {
  CorporateFarmsTableResponse,
  CorporateKpisResponse,
  DadosGraficosCorporativos,
  FiltrosDashboard,
  OpcoesFiltrosCorporativos,
} from '@/types/dashboard.types';
import { TELEMETRY_API_URL } from '@/utils/constants';
import { isAbortError } from '@/utils/delay';
import { fetchComAuth } from './apiClient';
import { ServiceError } from './authService';

function montarParametrosFiltros(filtros?: Partial<FiltrosDashboard>): string {
  if (!filtros) return '';
  const params = new URLSearchParams();
  if (filtros.periodo && filtros.periodo !== 'atual' && filtros.periodo !== 'todos') {
    params.set('month', filtros.periodo);
  }
  if (filtros.estado && filtros.estado !== 'todos') {
    params.set('state', filtros.estado);
  }
  if (filtros.gerencia && filtros.gerencia !== 'todas' && filtros.gerencia !== 'Todas') {
    params.set('management', filtros.gerencia);
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function montarHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
  };
}

export async function getCorporateKpis(
  filtros?: FiltrosDashboard,
  signal?: AbortSignal,
): Promise<CorporateKpisResponse> {
  const query = montarParametrosFiltros(filtros);
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/kpis${query}`;

  try {
    const res = await fetchComAuth(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as CorporateKpisResponse;
    }

    if (res.status === 401 || res.status === 403) {
      throw new ServiceError('Acesso não autorizado aos indicadores corporativos.');
    }
    if (res.status === 404) {
      throw new ServiceError('Serviço de indicadores corporativos não encontrado.');
    }

    throw new ServiceError(`Erro ao carregar indicadores corporativos (HTTP ${res.status}).`);
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Não foi possível conectar ao serviço de telemetria.');
  }
}

export async function getCorporateFilters(
  signal?: AbortSignal,
): Promise<OpcoesFiltrosCorporativos> {
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/filters`;

  try {
    const res = await fetchComAuth(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as OpcoesFiltrosCorporativos;
    }

    if (res.status === 401 || res.status === 403) {
      throw new ServiceError('Acesso não autorizado aos filtros corporativos.');
    }

    throw new ServiceError(`Erro ao carregar filtros corporativos (HTTP ${res.status}).`);
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Não foi possível carregar as opções de filtros.');
  }
}

export async function getCorporateChartData<K extends keyof DadosGraficosCorporativos>(
  chartId: K,
  filtros?: FiltrosDashboard,
  signal?: AbortSignal,
): Promise<DadosGraficosCorporativos[K]> {
  const query = montarParametrosFiltros(filtros);
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/charts/${chartId}/data${query}`;

  try {
    const res = await fetchComAuth(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as DadosGraficosCorporativos[K];
    }

    if (res.status === 401 || res.status === 403) {
      throw new ServiceError('Acesso não autorizado aos dados do gráfico.');
    }
    if (res.status === 404) {
      throw new ServiceError('Gráfico não encontrado no serviço de telemetria.');
    }

    throw new ServiceError(`Erro ao carregar gráfico (HTTP ${res.status}).`);
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Não foi possível carregar os dados do gráfico.');
  }
}

export async function getCorporateFarms(
  filtros?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    state?: string;
    management?: string;
    month?: string;
  },
  signal?: AbortSignal,
): Promise<CorporateFarmsTableResponse> {
  const params = new URLSearchParams();
  if (filtros?.search) params.set('search', filtros.search);
  if (filtros?.sortBy) params.set('sort_by', filtros.sortBy);
  if (filtros?.order) params.set('order', filtros.order);
  if (filtros?.page) params.set('page', String(filtros.page));
  if (filtros?.limit) params.set('limit', String(filtros.limit));
  if (filtros?.state && filtros.state !== 'todos') params.set('state', filtros.state);
  if (filtros?.management && filtros.management !== 'todas' && filtros.management !== 'Todas') {
    params.set('management', filtros.management);
  }
  if (filtros?.month && filtros.month !== 'atual' && filtros.month !== 'todos') {
    params.set('month', filtros.month);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/farms${query}`;

  try {
    const res = await fetchComAuth(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as CorporateFarmsTableResponse;
    }

    throw new ServiceError(`Erro ao carregar lista de granjas (HTTP ${res.status}).`);
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Não foi possível carregar a lista de granjas.');
  }
}
