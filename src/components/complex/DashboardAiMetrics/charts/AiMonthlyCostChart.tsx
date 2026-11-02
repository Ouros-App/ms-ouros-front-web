import type { ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AdminAiMonthlyPoint } from '@/services/adminAiMetricsService';
import { AiCustomTooltip, AiCustomLegend } from './ChartHelpers';

export interface AiMonthlyCostChartProps {
  readonly dados: readonly AdminAiMonthlyPoint[];
}

export function AiMonthlyCostChart({ dados }: AiMonthlyCostChartProps): ReactNode {
  return (
    <div className="dashboard-ai-metrics__chart-wrapper" aria-label="Gráfico de linha de custo mensal de IA">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={[...dados]} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: '#CBD5E1' }}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickFormatter={(val: number) => {
              if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
              if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
              return String(val);
            }}
          />
          <Tooltip content={<AiCustomTooltip />} />
          <Legend content={<AiCustomLegend />} />
          <Line
            type="monotone"
            name="Ano passado"
            dataKey="previous_year_cost"
            stroke="#110B95"
            strokeWidth={3}
            dot={{ r: 4, fill: '#110B95', strokeWidth: 1, stroke: '#FFFFFF' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            name="Este ano"
            dataKey="current_year_cost"
            stroke="#D8A23A"
            strokeWidth={3}
            dot={{ r: 4, fill: '#D8A23A', strokeWidth: 1, stroke: '#FFFFFF' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
