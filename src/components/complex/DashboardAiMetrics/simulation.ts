import type { AdminAiKpiItem, AdminAiKpisResponse, PrometheusChartData } from '@/services/adminAiMetricsService';

export function getSimulationScale(targetUsersInput: string, currentUsers: number | null): number | null {
  const targetUsers = Number(targetUsersInput);
  if (
    !Number.isSafeInteger(targetUsers)
    || targetUsers <= 0
    || currentUsers === null
    || !Number.isSafeInteger(currentUsers)
    || currentUsers <= 0
  ) return null;
  return targetUsers / currentUsers;
}

function formatProjectedValue(value: number, item: AdminAiKpiItem): string {
  const currency = item.formatted.startsWith('US$') ? 'USD' : item.formatted.startsWith('R$') ? 'BRL' : null;
  if (currency) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 6,
    }).format(value);
  }
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: item.unit === 'tokens' || item.unit === 'usuários' ? 0 : 6,
  }).format(value);
}

function scaleKpi(item: AdminAiKpiItem, scale: number): AdminAiKpiItem {
  if (item.value === null) return item;
  const value = item.value * scale;
  return Number.isFinite(value)
    ? { ...item, value, formatted: formatProjectedValue(value, item) }
    : { ...item, value: null, formatted: 'Sem dados' };
}

export function scaleAiKpis(kpis: AdminAiKpisResponse, scale: number, targetUsers: number): AdminAiKpisResponse {
  return {
    ...kpis,
    token_spend: scaleKpi(kpis.token_spend, scale),
    total_tokens: scaleKpi(kpis.total_tokens, scale),
    active_users: {
      ...kpis.active_users,
      value: targetUsers,
      formatted: formatProjectedValue(targetUsers, kpis.active_users),
    },
  };
}

export function scalePrometheusCharts(charts: PrometheusChartData[], scale: number): PrometheusChartData[] {
  return charts.map((chart) => chart.chart.id === 'ai-p95-latency'
    ? chart
    : {
      ...chart,
      items: chart.items.map((item) => {
        const value = Number(item.value);
        return Number.isFinite(value) ? { ...item, value: value * scale } : item;
      }),
    });
}
