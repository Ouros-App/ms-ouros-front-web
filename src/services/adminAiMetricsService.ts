import { fetchComAuth } from './apiClient';
import { ServiceError } from './authService';
import { TELEMETRY_API_URL } from '@/utils/constants';

export interface PrometheusChart {
  id: string;
  title: string;
  type: 'counter' | 'bar' | 'line' | 'pie';
}

export interface PrometheusChartData {
  dashboard_id: string;
  chart: PrometheusChart;
  items: Array<Record<string, string | number>>;
}

const AI_DASHBOARD_ID = 'prometheus-ai';
const AI_CHART_IDS = [
  'ai-request-rate',
  'ai-p95-latency',
  'ai-chat-outcomes',
  'ai-agent-usage',
  'ai-tool-usage',
] as const;

export interface PrometheusAiChartsResult {
  charts: PrometheusChartData[];
  failures: string[];
}

/** Fetches every AI chart, retaining partial successes and propagating cancellation. */
export async function getPrometheusAiCharts(signal?: AbortSignal): Promise<PrometheusAiChartsResult> {
  const results = await Promise.allSettled(
    AI_CHART_IDS.map(async (chartId) => {
      const url = `${TELEMETRY_API_URL}/v1/dashboards/${AI_DASHBOARD_ID}/charts/${chartId}/data`;
      const response = await fetchComAuth(url, { signal });
      if (!response.ok) {
        throw new ServiceError(`Erro ao carregar dados Prometheus (${response.status})`, response.status);
      }
      return (await response.json()) as PrometheusChartData;
    }),
  );
  if (signal?.aborted) throw new DOMException('A consulta foi cancelada.', 'AbortError');

  const charts: PrometheusChartData[] = [];
  const failures: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      charts.push(result.value);
    } else {
      failures.push(AI_CHART_IDS[index]);
    }
  });

  if (charts.length === 0) {
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  }
  return { charts, failures };
}

export interface AdminAiKpiItem {
  value: number | null;
  formatted: string;
  unit: string | null;
  year: number | null;
  period: string | null;
}

export interface AdminAiKpisResponse {
  token_spend: AdminAiKpiItem;
  unit_cost: AdminAiKpiItem;
  active_users: AdminAiKpiItem;
  inter_agent_latency: AdminAiKpiItem;
  average_response_latency: AdminAiKpiItem;
  total_response_time: AdminAiKpiItem;
  error_rate: AdminAiKpiItem;
  cost_per_resolution?: AdminAiKpiItem;
  estimated_roi?: AdminAiKpiItem;
  total_tokens: AdminAiKpiItem;
}

/** Fetches monthly AI totals already formatted by the telemetry API. */
export async function getAdminAiKpis(month: string, signal?: AbortSignal): Promise<AdminAiKpisResponse> {
  const params = new URLSearchParams({ month });
  const url = `${TELEMETRY_API_URL}/v1/admin/ai-metrics/kpis?${params.toString()}`;
  const response = await fetchComAuth(url.toString(), { signal });
  if (!response.ok) {
    throw new ServiceError(`Erro ao carregar KPIs de IA (${response.status})`, response.status);
  }
  return (await response.json()) as AdminAiKpisResponse;
}
