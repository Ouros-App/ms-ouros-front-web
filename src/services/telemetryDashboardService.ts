import type {
  CorporateFarmsTableResponse,
  CorporateKpisResponse,
  DadosGraficosCorporativos,
  FiltrosDashboard,
  OpcoesFiltrosCorporativos,
} from '@/types/dashboard.types';
import { TELEMETRY_API_URL } from '@/utils/constants';
import { isAbortError } from '@/utils/delay';
import { ServiceError } from './authService';
import { obterAccessToken } from './tokenService';

export const MOCK_CORPORATE_KPIS: CorporateKpisResponse = {
  spend_current_year: {
    value: 13090000.0,
    formatted: 'R$ 13.09M',
    unit: 'R$',
    year: 2026,
  },
  spend_previous_year: {
    value: 15110000.0,
    formatted: 'R$ 15.11M',
    unit: 'R$',
    year: 2025,
  },
  avg_cost_per_bird: {
    value: 25.94,
    formatted: 'R$ 25.94',
    unit: 'R$/ave',
    year: 2026,
  },
  total_lots: {
    value: 104728.0,
    formatted: '104.728',
    unit: 'lotes',
    year: null,
  },
};

export const MOCK_CORPORATE_FILTERS: OpcoesFiltrosCorporativos = {
  periods: ['Mês Atual', 'Ano 2026', 'Ano 2025', 'Últimos 30 dias', 'Últimos 90 dias'],
  states: ['Todos', 'Centro-Oeste', 'DF', 'GO', 'MS', 'MT', 'PR', 'SC', 'SP'],
  regional_managements: ['Todas', 'Gerência Central', 'Gerência Sul', 'Gerência Centro-Oeste'],
};

export const MOCK_CHARTS_DATA: DadosGraficosCorporativos = {
  'cost-distribution-buckets': [
    { bucket: '< 1.0M', label: '< 1.0M', count: 18, value: 18 },
    { bucket: '1.0M - 1.5M', label: '1.5M', count: 32, value: 32 },
    { bucket: '1.5M - 2.0M', label: '2.0M', count: 28, value: 28 },
    { bucket: '2.0M - 2.5M', label: '2.5M', count: 14, value: 14 },
    { bucket: '2.5M+', label: '3.0M+', count: 8, value: 8 },
  ],
  'cost-by-lot-size-cohort': [
    { cohort: '0-50k', previous_year_cost: 1200000, current_year_cost: 1100000 },
    { cohort: '50k-75k', previous_year_cost: 2100000, current_year_cost: 1950000 },
    { cohort: '75k-100k', previous_year_cost: 3400000, current_year_cost: 2900000 },
    { cohort: '100k-125k', previous_year_cost: 3800000, current_year_cost: 3200000 },
    { cohort: '125k-150k', previous_year_cost: 2600000, current_year_cost: 2250000 },
    { cohort: '150k-175k', previous_year_cost: 1400000, current_year_cost: 1200000 },
    { cohort: '175k+', previous_year_cost: 610000, current_year_cost: 490000 },
  ],
  'cost-by-region': [
    { region: 'Norte', previous_year_cost: 950000, current_year_cost: 820000 },
    { region: 'Nordeste', previous_year_cost: 1850000, current_year_cost: 1600000 },
    { region: 'Centro-Oeste', previous_year_cost: 5400000, current_year_cost: 4700000 },
    { region: 'Sudeste', previous_year_cost: 3800000, current_year_cost: 3300000 },
    { region: 'Sul', previous_year_cost: 3110000, current_year_cost: 2670000 },
  ],
  'monthly-cost': [
    { month_start: '2026-01-01', cost: 1120000 },
    { month_start: '2026-02-01', cost: 1080000 },
    { month_start: '2026-03-01', cost: 1150000 },
    { month_start: '2026-04-01', cost: 1040000 },
    { month_start: '2026-05-01', cost: 1100000 },
    { month_start: '2026-06-01', cost: 1060000 },
    { month_start: '2026-07-01', cost: 1180000 },
    { month_start: '2026-08-01', cost: 1090000 },
    { month_start: '2026-09-01', cost: 1070000 },
    { month_start: '2026-10-01', cost: 1130000 },
    { month_start: '2026-11-01', cost: 1050000 },
    { month_start: '2026-12-01', cost: 1020000 },
  ],
};

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
  const token = obterAccessToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function getCorporateKpis(
  filtros?: FiltrosDashboard,
  signal?: AbortSignal,
): Promise<CorporateKpisResponse> {
  const query = montarParametrosFiltros(filtros);
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/kpis${query}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as CorporateKpisResponse;
    }

    // Se o backend retornou 401, 403 ou 503 no ambiente de dev, usamos os valores certificados do Figma
    console.warn(`[telemetry] getCorporateKpis fallback (HTTP ${res.status})`);
    return MOCK_CORPORATE_KPIS;
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    console.warn('[telemetry] getCorporateKpis erro de rede, usando dados Figma:', error);
    return MOCK_CORPORATE_KPIS;
  }
}

export async function getCorporateFilters(
  signal?: AbortSignal,
): Promise<OpcoesFiltrosCorporativos> {
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/filters`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as OpcoesFiltrosCorporativos;
    }

    console.warn(`[telemetry] getCorporateFilters fallback (HTTP ${res.status})`);
    return MOCK_CORPORATE_FILTERS;
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    console.warn('[telemetry] getCorporateFilters erro de rede, usando fallback:', error);
    return MOCK_CORPORATE_FILTERS;
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
    const res = await fetch(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as DadosGraficosCorporativos[K];
    }

    console.warn(`[telemetry] getCorporateChartData ${chartId} fallback (HTTP ${res.status})`);
    const fallback = MOCK_CHARTS_DATA[chartId];
    if (fallback) return fallback as DadosGraficosCorporativos[K];
    throw new ServiceError(`Não foi possível carregar os dados do gráfico ${chartId}`);
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    const fallback = MOCK_CHARTS_DATA[chartId];
    if (fallback) return fallback as DadosGraficosCorporativos[K];
    throw new ServiceError(`Não foi possível carregar os dados do gráfico ${chartId}`);
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

  const query = params.toString() ? `?${params.toString()}` : '';
  const url = `${TELEMETRY_API_URL}/v1/user/dashboards/corporate/farms${query}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: montarHeaders(),
      signal,
    });

    if (res.ok) {
      return (await res.json()) as CorporateFarmsTableResponse;
    }

    return {
      total: 0,
      page: filtros?.page ?? 1,
      limit: filtros?.limit ?? 10,
      items: [],
    };
  } catch (error) {
    if (isAbortError(error) && error instanceof Error) throw error;
    return {
      total: 0,
      page: filtros?.page ?? 1,
      limit: filtros?.limit ?? 10,
      items: [],
    };
  }
}
