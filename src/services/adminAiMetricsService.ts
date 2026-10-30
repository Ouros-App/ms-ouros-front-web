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

export async function getAdminAiKpis(enterpriseId?: number, signal?: AbortSignal): Promise<AdminAiKpisResponse> {
  const query = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/kpis${query}`;
  try {
    const res = await fetchComAuth(url, { signal });
    if (res.ok) return (await res.json()) as AdminAiKpisResponse;
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

export async function getAdminAiSessionsPage(query: PageQuery, enterpriseId?: number, signal?: AbortSignal): Promise<PageResponse<AdminAiSessionItem>> {
  const data = await getAdminAiSessions({ page: query.page + 1, limit: query.size, search: query.search, enterpriseId }, signal);
  return { content: data.items, page: data.page - 1, size: data.limit,
    totalElements: data.total, totalPages: Math.ceil(data.total / data.limit) };
}
