import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getPrometheusAiCharts } from '@/services/adminAiMetricsService';
import type { PrometheusChartData } from '@/services/adminAiMetricsService';
import './DashboardAiMetrics.css';

const chartColors = ['#6750a4', '#d8a23a', '#299d8f', '#e76f51', '#4f7cac'];

function AiChart({ chart, color }: { chart: PrometheusChartData; color: string }): ReactNode {
  const isTimeSeries = chart.chart.type === 'line';
  const labelKey = isTimeSeries ? 'time' : 'label';

  return (
    <section className="dashboard-ai-metrics__chart-card" aria-label={chart.chart.title}>
      <h2 className="dashboard-ai-metrics__chart-title">{chart.chart.title}</h2>
      {chart.items.length === 0 ? (
        <p className="dashboard-ai-metrics__vazio">Sem dados retornados pelo Prometheus.</p>
      ) : (
        <div className="dashboard-ai-metrics__grafico-shell">
          <ResponsiveContainer width="100%" height="100%">
            {isTimeSeries ? (
              <LineChart data={chart.items} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={chart.items} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export function DashboardAiMetrics(): ReactNode {
  const [charts, setCharts] = useState<PrometheusChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void getPrometheusAiCharts(controller.signal)
      .then(setCharts)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Erro ao carregar telemetria Prometheus.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="dashboard-ai-metrics" aria-label="Observabilidade Midas AI">
      <p className="dashboard-ai-metrics__description">
        Métricas operacionais do Midas AI consultadas diretamente no dashboard Prometheus.
      </p>
      {loading && <output className="dashboard-ai-metrics__info">Carregando dados do Prometheus…</output>}
      {error && <p role="alert" className="dashboard-ai-metrics__info">{error}</p>}
      {!loading && !error && charts.length === 0 && (
        <p className="dashboard-ai-metrics__info">Nenhum gráfico de IA disponível no dashboard Prometheus.</p>
      )}
      {!error && charts.length > 0 && (
        <div className="dashboard-ai-metrics__charts-grid">
          {charts.map((chart, index) => (
            <AiChart key={chart.chart.id} chart={chart} color={chartColors[index % chartColors.length]} />
          ))}
        </div>
      )}
    </div>
  );
}
