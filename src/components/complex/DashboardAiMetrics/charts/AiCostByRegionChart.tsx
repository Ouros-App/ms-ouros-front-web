import type { ReactNode } from 'react';
import type { AdminAiRegionPoint } from '@/services/adminAiMetricsService';
import { AiComparativeBarChart } from './ChartHelpers';

export interface AiCostByRegionChartProps {
  readonly dados: readonly AdminAiRegionPoint[];
}

export function AiCostByRegionChart({ dados }: AiCostByRegionChartProps): ReactNode {
  return (
    <AiComparativeBarChart
      dados={dados as unknown as readonly Record<string, unknown>[]}
      dataKeyX="region"
      ariaLabel="Gráfico comparativo de custo por região"
      barCategoryGap="28%"
    />
  );
}
