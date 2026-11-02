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

export async function getPrometheusAiCharts(signal?: AbortSignal): Promise<PrometheusChartData[]> {
  const results = await Promise.all(
    AI_CHART_IDS.map(async (chartId) => {
      const url = `${TELEMETRY_API_URL}/v1/dashboards/${AI_DASHBOARD_ID}/charts/${chartId}/data`;
      const response = await fetchComAuth(url, { signal });
      if (!response.ok) {
        throw new ServiceError(`Erro ao carregar dados Prometheus (${response.status})`);
      }
      return (await response.json()) as PrometheusChartData;
    }),
  );
  return results;
}
