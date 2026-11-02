import type { ReactNode } from 'react';
import type { AdminAiComparativeCohortPoint } from '@/services/adminAiMetricsService';
import { AiComparativeBarChart } from './ChartHelpers';

export interface AiTokenSpendChartProps {
  readonly dados: readonly AdminAiComparativeCohortPoint[];
}

export function AiTokenSpendChart({ dados }: AiTokenSpendChartProps): ReactNode {
  return (
    <AiComparativeBarChart
      dados={dados as unknown as readonly Record<string, unknown>[]}
      dataKeyX="cohort"
      ariaLabel="Gráfico de barras de gasto de tokens por coortes"
      barCategoryGap="24%"
    />
  );
}
