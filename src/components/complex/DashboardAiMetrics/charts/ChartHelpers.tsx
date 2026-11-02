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

export interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: readonly {
    readonly value?: number | string;
    readonly name?: string;
    readonly color?: string;
  }[];
  readonly label?: string;
}

export function AiCustomTooltip({ active, payload, label }: CustomTooltipProps): ReactNode {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-ai-metrics__tooltip" role="tooltip">
      <p className="dashboard-ai-metrics__tooltip-label">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="dashboard-ai-metrics__tooltip-row">
          <span
            className="dashboard-ai-metrics__tooltip-dot"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="dashboard-ai-metrics__tooltip-name">{entry.name}:</span>
          <span className="dashboard-ai-metrics__tooltip-val">
            R$ {Number(entry.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AiCustomLegend(): ReactNode {
  return (
    <div className="dashboard-ai-metrics__legend-container">
      <div className="dashboard-ai-metrics__legend-item">
        <span
          className="dashboard-ai-metrics__legend-indicator dashboard-ai-metrics__legend-indicator--previous"
          aria-hidden="true"
        />
        <span className="dashboard-ai-metrics__legend-label">Ano passado</span>
      </div>
      <div className="dashboard-ai-metrics__legend-item">
        <span
          className="dashboard-ai-metrics__legend-indicator dashboard-ai-metrics__legend-indicator--current"
          aria-hidden="true"
        />
        <span className="dashboard-ai-metrics__legend-label">Este ano</span>
      </div>
    </div>
  );
}

export interface AiComparativeBarChartProps {
  readonly dados: readonly Record<string, unknown>[];
  readonly dataKeyX: string;
  readonly ariaLabel: string;
  readonly barCategoryGap?: string;
}

export function AiComparativeBarChart({
  dados,
  dataKeyX,
  ariaLabel,
  barCategoryGap = '24%',
}: AiComparativeBarChartProps): ReactNode {
  return (
    <div className="dashboard-ai-metrics__chart-wrapper" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={[...dados]}
          margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          barCategoryGap={barCategoryGap}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey={dataKeyX}
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
