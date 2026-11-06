import { describe, expect, it } from 'vitest';
import type { AdminAiKpisResponse, PrometheusChartData } from '@/services/adminAiMetricsService';
import { getSimulationScale, scaleAiKpis, scalePrometheusCharts } from '@/components/complex/DashboardAiMetrics/simulation';

const kpis: AdminAiKpisResponse = {
  token_spend: { value: 1.25, formatted: 'US$ 1,25', unit: 'US$', year: null, period: '2026-11' },
  total_tokens: { value: 1250, formatted: '1.250', unit: 'tokens', year: null, period: '2026-11' },
  unit_cost: { value: 1, formatted: 'US$ 1,00', unit: 'US$/1k tokens', year: null, period: '2026-11' },
  active_users: { value: 10, formatted: '10', unit: 'usuários', year: 2026, period: null },
  inter_agent_latency: { value: null, formatted: 'N/D', unit: 'ms', year: null, period: '2026-11' },
  average_response_latency: { value: 95, formatted: '95,00', unit: 'ms', year: null, period: '2026-11' },
  total_response_time: { value: 0.95, formatted: '0,95', unit: 's', year: null, period: '2026-11' },
  error_rate: { value: 2, formatted: '2,00', unit: '%', year: null, period: '2026-11' },
  estimated_roi: { value: null, formatted: 'N/D', unit: '%', year: null, period: '2026-11' },
  cost_per_resolution: { value: null, formatted: 'N/D', unit: 'R$/resolução', year: null, period: '2026-11' },
};

describe('AI metrics simulation', () => {
  it('projects KPIs to an absolute user count and preserves unit cost', () => {
    const projected = scaleAiKpis(kpis, 3, 30);

    expect(projected.token_spend.value).toBe(3.75);
    expect(projected.token_spend.formatted).toContain('3,75');
    expect(projected.total_tokens.value).toBe(3750);
    expect(projected.unit_cost).toEqual(kpis.unit_cost);
    expect(projected.active_users.value).toBe(30);
  });

  it('scales event counts but leaves observed latency unchanged', () => {
    const charts: PrometheusChartData[] = [
      {
        dashboard_id: 'prometheus-ai',
        chart: { id: 'ai-tool-usage', title: 'Uso de tools', type: 'bar' },
        items: [{ label: 'search', value: 2 }],
      },
      {
        dashboard_id: 'prometheus-ai',
        chart: { id: 'ai-p95-latency', title: 'Latência p95', type: 'bar' },
        items: [{ label: '/chat', value: 0.25 }],
      },
    ];

    const projected = scalePrometheusCharts(charts, 3);

    expect(projected[0].items).toEqual([{ label: 'search', value: 6 }]);
    expect(projected[1].items).toEqual([{ label: '/chat', value: 0.25 }]);
    expect(charts[0].items[0].value).toBe(2);
  });

  it('calculates the target-to-current user ratio and rejects invalid bases', () => {
    expect(getSimulationScale('30', 10)).toBe(3);
    expect(getSimulationScale('10', 10)).toBe(1);
    expect(getSimulationScale('0', 10)).toBeNull();
    expect(getSimulationScale('1.5', 10)).toBeNull();
    expect(getSimulationScale('30', 0)).toBeNull();
    expect(getSimulationScale('30', null)).toBeNull();
  });
});
