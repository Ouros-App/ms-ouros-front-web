import type { ReactNode } from 'react';
import type { AdminAiComparativeCohortPoint } from '@/services/adminAiMetricsService';
import { AiComparativeBarChart } from './ChartHelpers';

export interface AiRequestSpendChartProps {
  readonly dados: readonly AdminAiComparativeCohortPoint[];
}

export function AiRequestSpendChart({ dados }: AiRequestSpendChartProps): ReactNode {
  return (
    <AiComparativeBarChart
      dados={dados as unknown as readonly Record<string, unknown>[]}
      dataKeyX="cohort"
      ariaLabel="Gráfico de barras de gasto por requisição"
      barCategoryGap="24%"
    />
  );
}
