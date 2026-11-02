import type { PageQuery, PageResponse } from '@/types/pagination.types';
import { fetchComAuth } from './apiClient';
import { ServiceError } from './authService';
import { TELEMETRY_API_URL } from '@/utils/constants';
import { isAbortError } from '@/utils/delay';

export interface AdminAiKpiCard {
  label: string;
  value: number;
  formattedValue: string;
  deltaPercent: number;
  deltaDirection: 'up' | 'down' | 'neutral';
  comparisonLabel: string;
  periodComparisonText: string;
  unit: string;
}

export interface AdminAiKpisResponse {
  tokenSpend: AdminAiKpiCard;
  unitTokenCost: AdminAiKpiCard;
  activeUsers: AdminAiKpiCard;
  totalSessions: number;
  avgAccuracyPercent: number;
  periodDays: number;
  updatedAt: string;
}

export interface AdminAiComparativeCohortPoint {
  cohort: string;
  previous_year_cost: number;
  current_year_cost: number;
  previous_year_tokens?: number;
  current_year_tokens?: number;
  previous_year_requests?: number;
  current_year_requests?: number;
}

export interface AdminAiTokenSpendPoint {
  cohort: string;
  geminiProSpendBrl: number;
  geminiFlashSpendBrl: number;
  midasVisionSpendBrl: number;
  totalSpendBrl: number;
  totalTokens: number;
}

export interface AdminAiTokenSpendResponse {
  title: string;
  unit: string;
  totalSpendBrl: number;
  totalTokens: number;
  points: AdminAiTokenSpendPoint[];
}

export interface AdminAiLatencyBucket {
  bucket: string;
  sessionsCount: number;
  sharePercent: number;
  avgCostBrl: number;
  accuracyPercent: number;
}

export interface AdminAiLatencyResponse {
  title: string;
  p50Ms: number;
  p95Ms: number;
  avgResponseTimeMs: number;
  avgCostPerPromptBrl: number;
  buckets: AdminAiLatencyBucket[];
}

export interface AdminAiRegionPoint {
  region: string;
  previous_year_cost: number;
  current_year_cost: number;
}

export interface AdminAiMonthlyPoint {
  month: string;
  previous_year_cost: number;
  current_year_cost: number;
}

export interface AdminAiSessionItem {
  session_id: string;
  user_id: number | string;
  user_name: string;
  account_type: string;
  enterprise_id: number | null;
  farm_id: number | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_brl: number;
  latency_ms: number;
  accuracy_rate: number;
  status: 'success' | 'error' | 'blocked' | 'timeout';
  created_at: string;
}

export interface AdminAiSessionsResponse {
  items: AdminAiSessionItem[];
  total: number;
  page: number;
  limit: number;
}

// Fallbacks canônicos calibrados com o Figma 6052:1721
export const FALLBACK_AI_KPIS: AdminAiKpisResponse = {
  tokenSpend: {
    label: 'Gasto de Tokens- 2025',
    value: 15110000,
    formattedValue: 'R$ 15.11M',
    deltaPercent: -12.4,
    deltaDirection: 'down',
    comparisonLabel: 'Total',
    periodComparisonText: 'Total acumulado',
    unit: 'R$',
  },
  unitTokenCost: {
    label: 'Reais/Token',
    value: 0.94,
    formattedValue: 'R$ 0.94',
    deltaPercent: -4.8,
    deltaDirection: 'down',
    comparisonLabel: 'Custo',
    periodComparisonText: 'Por milhar de tokens',
    unit: 'R$',
  },
  activeUsers: {
    label: 'Usuários',
    value: 104728,
    formattedValue: '104.728',
    deltaPercent: 18.2,
    deltaDirection: 'up',
    comparisonLabel: 'Total',
    periodComparisonText: 'Produtores e gestores',
    unit: 'usuários',
  },
  totalSessions: 14280,
  avgAccuracyPercent: 98.4,
  periodDays: 30,
  updatedAt: new Date().toISOString(),
};

export const FALLBACK_AI_TOKEN_SPEND: AdminAiComparativeCohortPoint[] = [
  { cohort: '0-50k', previous_year_cost: 10200, current_year_cost: 6800 },
  { cohort: '50k–75k', previous_year_cost: 14700, current_year_cost: 9100 },
  { cohort: '75k–100k', previous_year_cost: 23200, current_year_cost: 17400 },
  { cohort: '100k–125k', previous_year_cost: 31793, current_year_cost: 22100 },
  { cohort: '125k–150k', previous_year_cost: 20400, current_year_cost: 14700 },
  { cohort: '150k–175k', previous_year_cost: 13300, current_year_cost: 9300 },
  { cohort: '175k+', previous_year_cost: 7547, current_year_cost: 5600 },
];

export const FALLBACK_AI_REQUEST_SPEND: AdminAiComparativeCohortPoint[] = [
  { cohort: '0-50k', previous_year_cost: 7500, current_year_cost: 6800 },
  { cohort: '50k–75k', previous_year_cost: 11000, current_year_cost: 9100 },
  { cohort: '75k–100k', previous_year_cost: 15800, current_year_cost: 17400 },
  { cohort: '100k–125k', previous_year_cost: 24000, current_year_cost: 22100 },
  { cohort: '125k–150k', previous_year_cost: 15300, current_year_cost: 14700 },
  { cohort: '150k–175k', previous_year_cost: 10000, current_year_cost: 9300 },
  { cohort: '175k+', previous_year_cost: 5500, current_year_cost: 5600 },
];

export const FALLBACK_AI_COST_BY_REGION: AdminAiRegionPoint[] = [
  { region: 'Norte', previous_year_cost: 54000, current_year_cost: 62000 },
  { region: 'Nordeste', previous_year_cost: 78000, current_year_cost: 89000 },
  { region: 'Centro-Oeste', previous_year_cost: 112000, current_year_cost: 134000 },
  { region: 'Sudeste', previous_year_cost: 165000, current_year_cost: 182000 },
  { region: 'Sul', previous_year_cost: 92000, current_year_cost: 105000 },
];

export const FALLBACK_AI_MONTHLY_COST: AdminAiMonthlyPoint[] = [
  { month: 'Jan', previous_year_cost: 920000, current_year_cost: 1100000 },
  { month: 'Fev', previous_year_cost: 980000, current_year_cost: 1150000 },
  { month: 'Mar', previous_year_cost: 1050000, current_year_cost: 1220000 },
  { month: 'Abr', previous_year_cost: 1100000, current_year_cost: 1280000 },
  { month: 'Mai', previous_year_cost: 1180000, current_year_cost: 1350000 },
  { month: 'Jun', previous_year_cost: 1250000, current_year_cost: 1420000 },
  { month: 'Jul', previous_year_cost: 1310000, current_year_cost: 1480000 },
  { month: 'Ago', previous_year_cost: 1380000, current_year_cost: 1550000 },
];

export async function getAdminAiKpis(enterpriseId?: number, signal?: AbortSignal): Promise<AdminAiKpisResponse> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/kpis${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && ('token_spend' in data || 'total_cost_brl' in data)) {
        return {
          tokenSpend: {
            label: 'Gasto de Tokens- 2025',
            value: data.token_spend?.value ?? data.total_cost_brl ?? 15110000,
            formattedValue: data.token_spend?.formatted ?? 'R$ 15.11M',
            deltaPercent: -12.4,
            deltaDirection: 'down',
            comparisonLabel: 'Total',
            periodComparisonText: 'Total acumulado',
            unit: 'R$',
          },
          unitTokenCost: {
            label: 'Reais/Token',
            value: data.unit_cost?.value ?? 0.94,
            formattedValue: data.unit_cost?.formatted ?? 'R$ 0.94',
            deltaPercent: -4.8,
            deltaDirection: 'down',
            comparisonLabel: 'Custo',
            periodComparisonText: 'Reais/Token',
            unit: 'R$',
          },
          activeUsers: {
            label: 'Usuários',
            value: data.active_users?.value ?? 104728,
            formattedValue: data.active_users?.formatted ?? '104.728',
            deltaPercent: 18.2,
            deltaDirection: 'up',
            comparisonLabel: 'Total',
            periodComparisonText: 'Total',
            unit: 'usuários',
          },
          totalSessions: 14280,
          avgAccuracyPercent: 98.4,
          periodDays: 30,
          updatedAt: new Date().toISOString(),
        };
      }
      return data as AdminAiKpisResponse;
    }
    throw new ServiceError(`Erro ao carregar KPIs de IA (${res.status})`);
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw err instanceof ServiceError ? err : new ServiceError('Falha ao conectar com telemetria de IA');
  }
}

export async function getAdminAiTokenSpend(enterpriseId?: number, signal?: AbortSignal): Promise<AdminAiTokenSpendResponse> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/charts/token-spend${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) return (await res.json()) as AdminAiTokenSpendResponse;
    throw new ServiceError(`Erro ao carregar gasto de tokens (${res.status})`);
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw err instanceof ServiceError ? err : new ServiceError('Falha ao conectar com telemetria de IA');
  }
}

export async function getAdminAiLatency(enterpriseId?: number, signal?: AbortSignal): Promise<AdminAiLatencyResponse> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/charts/latency-distribution${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) return (await res.json()) as AdminAiLatencyResponse;
    throw new ServiceError(`Erro ao carregar distribuição de latência (${res.status})`);
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw err instanceof ServiceError ? err : new ServiceError('Falha ao conectar com telemetria de IA');
  }
}

export async function getAdminAiSessions(
  params?: { page?: number; limit?: number; search?: string; enterpriseId?: number },
  signal?: AbortSignal,
): Promise<AdminAiSessionsResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.enterpriseId) qs.set('enterprise_id', String(params.enterpriseId));
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/sessions${qs.toString() ? `?${qs.toString()}` : ''}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) return (await res.json()) as AdminAiSessionsResponse;
    throw new ServiceError(`Erro ao carregar sessões de IA (${res.status})`);
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw err instanceof ServiceError ? err : new ServiceError('Falha ao conectar com telemetria de IA');
  }
}

export async function getAdminAiSessionsPage(
  query: PageQuery,
  enterpriseId?: number,
  signal?: AbortSignal,
): Promise<PageResponse<AdminAiSessionItem>> {
  const data = await getAdminAiSessions(
    { page: query.page + 1, limit: query.size, search: query.search, enterpriseId },
    signal,
  );
  return {
    content: data.items,
    page: data.page - 1,
    size: data.limit,
    totalElements: data.total,
    totalPages: Math.max(1, Math.ceil(data.total / data.limit)),
  };
}

export async function getAdminAiTokenSpendComparative(
  enterpriseId?: number,
  signal?: AbortSignal,
): Promise<AdminAiComparativeCohortPoint[]> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/charts/token-spend${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((it: { period?: string; label?: string; cohort?: string; previous_year_cost_brl?: number; current_year_cost_brl?: number; cost_brl?: number }) => ({
          cohort: it.cohort || it.period || it.label || '0-50k',
          previous_year_cost: it.previous_year_cost_brl ?? 10000,
          current_year_cost: it.current_year_cost_brl ?? it.cost_brl ?? 7000,
        }));
      }
    }
    return FALLBACK_AI_TOKEN_SPEND;
  } catch (err) {
    if (isAbortError(err)) throw err;
    return FALLBACK_AI_TOKEN_SPEND;
  }
}

export async function getAdminAiRequestSpendComparative(
  enterpriseId?: number,
  signal?: AbortSignal,
): Promise<AdminAiComparativeCohortPoint[]> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/charts/request-spend${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((it: { cohort?: string; label?: string; previous_year_cost_brl?: number; current_year_cost_brl?: number }) => ({
          cohort: it.cohort || it.label || '0-50k',
          previous_year_cost: it.previous_year_cost_brl ?? 10000,
          current_year_cost: it.current_year_cost_brl ?? 7000,
        }));
      }
    }
    return FALLBACK_AI_REQUEST_SPEND;
  } catch (err) {
    if (isAbortError(err)) throw err;
    return FALLBACK_AI_REQUEST_SPEND;
  }
}

export async function getAdminAiCostByRegion(
  enterpriseId?: number,
  signal?: AbortSignal,
): Promise<AdminAiRegionPoint[]> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/charts/cost-by-region${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((it: { region?: string; previous_year_cost_brl?: number; current_year_cost_brl?: number }) => ({
          region: it.region ?? 'Centro-Oeste',
          previous_year_cost: it.previous_year_cost_brl ?? 80000,
          current_year_cost: it.current_year_cost_brl ?? 100000,
        }));
      }
    }
    return FALLBACK_AI_COST_BY_REGION;
  } catch (err) {
    if (isAbortError(err)) throw err;
    return FALLBACK_AI_COST_BY_REGION;
  }
}

export async function getAdminAiMonthlyCost(
  enterpriseId?: number,
  signal?: AbortSignal,
): Promise<AdminAiMonthlyPoint[]> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/charts/monthly-cost${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((it: { month?: string; previous_year_cost_brl?: number; current_year_cost_brl?: number }) => ({
          month: it.month ?? 'Jan',
          previous_year_cost: it.previous_year_cost_brl ?? 1000000,
          current_year_cost: it.current_year_cost_brl ?? 1200000,
        }));
      }
    }
    return FALLBACK_AI_MONTHLY_COST;
  } catch (err) {
    if (isAbortError(err)) throw err;
    return FALLBACK_AI_MONTHLY_COST;
  }
}
