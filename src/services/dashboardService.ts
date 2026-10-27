import type { FiltrosDashboard, IndicadoresDashboard } from '@/types/dashboard.types';
import { getCorporateKpis } from './telemetryDashboardService';

export async function obterIndicadoresDashboard(
  filtros: FiltrosDashboard,
  signal?: AbortSignal,
): Promise<IndicadoresDashboard> {
  const corporate = await getCorporateKpis(filtros, signal);
  return {
    gastoAnoPassado: corporate.spend_previous_year.value,
    gastoAnoAtual: corporate.spend_current_year.value,
    custoPorAve: corporate.avg_cost_per_bird.value,
    totalLotes: Math.round(corporate.total_lots.value),
  };
}

export { getCorporateKpis } from './telemetryDashboardService';
