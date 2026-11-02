import type { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AdminAiComparativeCohortPoint } from '@/services/adminAiMetricsService';
import { AiCustomTooltip, AiCustomLegend } from './ChartHelpers';

export interface AiTokenSpendChartProps {
  readonly dados: readonly AdminAiComparativeCohortPoint[];
}

export function AiTokenSpendChart({ dados }: AiTokenSpendChartProps): ReactNode {
  return (
    <div className="dashboard-ai-metrics__chart-wrapper" aria-label="Gráfico de barras de gasto de tokens por coortes">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={[...dados]}
          margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          barCategoryGap="24%"
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="cohort"
            tickLine={false}
            axisLine={{ stroke: '#CBD5E1' }}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickFormatter={(val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val))}
          />
          <Tooltip content={<AiCustomTooltip />} />
          <Legend content={<AiCustomLegend />} />
          <Bar
            name="Ano passado"
            dataKey="previous_year_cost"
            fill="#110B95"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            name="Este ano"
            dataKey="current_year_cost"
            fill="#D8A23A"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
