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
import { getAdminAiKpis, getPrometheusAiCharts } from '@/services/adminAiMetricsService';
import type { AdminAiKpiItem, AdminAiKpisResponse, PrometheusChartData } from '@/services/adminAiMetricsService';
import './DashboardAiMetrics.css';

const chartUnits: Record<string, string> = {
  'ai-request-rate': 'req/s',
  'ai-p95-latency': 'ms',
  'ai-chat-outcomes': 'solicitações no mês',
  'ai-agent-usage': 'eventos no mês',
  'ai-tool-usage': 'eventos no mês',
};
const chartColors = ['#6750a4', '#d8a23a', '#299d8f', '#e76f51', '#4f7cac'];
const INTERVALO_ATUALIZACAO_MS = 10_000;

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function KpiCard({
  label,
  item,
  showUnit = true,
}: {
  label: string;
  item: AdminAiKpiItem | undefined;
  showUnit?: boolean;
}): ReactNode {
  return (
    <section className="dashboard-ai-metrics__kpi-card" aria-label={label}>
      <h2>{label}</h2>
      <strong>{!item || item.value === null ? 'Sem dados' : item.formatted}</strong>
      {showUnit && item?.unit && <span>{item.unit}</span>}
    </section>
  );
}

/** Renders the chart type and labels defined by a Prometheus chart payload. */
function AiChart({ chart, color }: Readonly<{ chart: PrometheusChartData; color: string }>): ReactNode {
  const latency = chart.chart.id === 'ai-p95-latency';
  const unit = chartUnits[chart.chart.id] ?? '';
  const title = unit ? `${chart.chart.title} (${unit})` : chart.chart.title;

  const items = latency
    ? chart.items.map((item) => ({ ...item, value: Number(item.value) * 1000 }))
    : chart.items;
  const isTimeSeries = chart.chart.type === 'line';
  const labelKey = isTimeSeries ? 'time' : 'label';

  return (
    <section className="dashboard-ai-metrics__chart-card" aria-label={title}>
      <h2 className="dashboard-ai-metrics__chart-title">{title}</h2>
      {items.length === 0 ? (
        <p className="dashboard-ai-metrics__vazio">Sem dados retornados pelo Prometheus.</p>
      ) : (
        <div className="dashboard-ai-metrics__grafico-shell">
          <ResponsiveContainer width="100%" height="100%">
            {isTimeSeries ? (
              <LineChart data={items} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 6 })} ${unit}`,
                    unit,
                  ]}
                />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={items} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 6 })} ${unit}`,
                    unit,
                  ]}
                />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

/** Renders Prometheus charts and reports individual and total query failures. */
export function DashboardAiMetrics(): ReactNode {
  const [charts, setCharts] = useState<PrometheusChartData[]>([]);
  const [failedCharts, setFailedCharts] = useState<string[]>([]);
  const [kpis, setKpis] = useState<AdminAiKpisResponse | null>(null);
  const [month, setMonth] = useState(getCurrentMonth);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setCharts([]);
    setFailedCharts([]);
    setError(null);

    let timer: number | undefined;
    let controller: AbortController | undefined;
    let disposed = false;

    const atualizar = async () => {
      const requestController = new AbortController();
      controller = requestController;
      try {
        const result = await getPrometheusAiCharts(month, requestController.signal);
        if (!disposed) {
          setCharts(result.charts);
          setFailedCharts(result.failures);
          setError(null);
        }
      } catch (cause: unknown) {
        if (!disposed && !requestController.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Erro ao carregar telemetria Prometheus.');
        }
      } finally {
        if (!disposed && !requestController.signal.aborted) {
          setLoading(false);
          timer = window.setTimeout(() => void atualizar(), INTERVALO_ATUALIZACAO_MS);
        }
      }
    };

    void atualizar();
    return () => {
      disposed = true;
      if (timer !== undefined) window.clearTimeout(timer);
      controller?.abort();
    };
  }, [month]);

  useEffect(() => {
    const controller = new AbortController();
    setKpiLoading(true);
    setKpiError(null);
    void getAdminAiKpis(month, controller.signal)
      .then(setKpis)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setKpiError(cause instanceof Error ? cause.message : 'Erro ao carregar KPIs de IA.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setKpiLoading(false);
      });
    return () => controller.abort();
  }, [month]);

  return (
    <div className="dashboard-ai-metrics" aria-label="Observabilidade Midas AI">
      <p className="dashboard-ai-metrics__description">
        Custos, tokens e gráficos do mês selecionado; req/s é média diária, latência p95 e eventos são agregados mensais. Usuários ativos vêm do snapshot Analytics.
      </p>
      <label className="dashboard-ai-metrics__month">
        Mês dos KPIs
        <input
          aria-label="Mês dos KPIs"
          type="month"
          value={month}
          required
          onChange={(event) => setMonth(event.target.value || getCurrentMonth())}
        />
      </label>
      {kpiLoading && <output className="dashboard-ai-metrics__info">Carregando KPIs de IA…</output>}
      {kpiError && <p role="alert" className="dashboard-ai-metrics__info">{kpiError}</p>}
      {!kpiLoading && !kpiError && (
        <div className="dashboard-ai-metrics__kpis">
          <KpiCard label="Custo de tokens" item={kpis?.token_spend} showUnit={false} />
          <KpiCard label="Tokens no mês" item={kpis?.total_tokens} />
          <KpiCard label="Custo por 1k tokens" item={kpis?.unit_cost} />
          <KpiCard label="Usuários ativos (snapshot)" item={kpis?.active_users} />
        </div>
      )}
      {loading && <output className="dashboard-ai-metrics__info">Carregando dados do Prometheus…</output>}
      {error && <p role="alert" className="dashboard-ai-metrics__info">{error}</p>}
      {!loading && !error && charts.length === 0 && (
        <p className="dashboard-ai-metrics__info">Nenhum gráfico de IA disponível no dashboard Prometheus.</p>
      )}
      {failedCharts.length > 0 && (
        <ul aria-label="Gráficos com falha" className="dashboard-ai-metrics__info">
          {failedCharts.map((chartId) => (
            <li key={chartId}>Falha ao carregar: {chartId}</li>
          ))}
        </ul>
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
