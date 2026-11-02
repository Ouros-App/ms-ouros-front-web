import type { ReactNode } from 'react';

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
