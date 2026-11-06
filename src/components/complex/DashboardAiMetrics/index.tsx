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
import { getSimulationScale, scaleAiKpis, scalePrometheusCharts } from './simulation';
import './DashboardAiMetrics.css';

const chartUnits: Record<string, string> = {
  'ai-request-rate': 'req/s',
  'ai-p95-latency': 'ms',
  'ai-chat-outcomes': 'solicitações/5 min',
  'ai-agent-usage': 'eventos/5 min',
  'ai-tool-usage': 'eventos/5 min',
};

const chartColors = ['#6750a4', '#d8a23a', '#299d8f', '#e76f51', '#4f7cac'];

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Displays one dashboard KPI and its configured unavailable-value label. */
function KpiCard({
  label,
  item,
  showUnit = true,
  unavailableLabel = 'Sem dados',
}: {
  label: string;
  item: AdminAiKpiItem | undefined;
  showUnit?: boolean;
  unavailableLabel?: string;
}): ReactNode {
  return (
    <section className="dashboard-ai-metrics__kpi-card" aria-label={label}>
      <h2>{label}</h2>
      <strong>{!item || item.value === null ? unavailableLabel : item.formatted}</strong>
      {showUnit && item?.unit && <span>{item.unit}</span>}
    </section>
  );
}

/** Renders the chart type and labels defined by a Prometheus chart payload. */
function AiChart({
  chart,
  color,
  simulation = false,
}: Readonly<{ chart: PrometheusChartData; color: string; simulation?: boolean }>): ReactNode {
  const latency = chart.chart.id === 'ai-p95-latency';
  const unit = chartUnits[chart.chart.id] ?? '';
  const chartTitle = unit ? `${chart.chart.title} (${unit})` : chart.chart.title;
  const title = simulation && !latency ? `${chartTitle} — estimativa` : chartTitle;

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

/** Renders AI management KPIs and Prometheus telemetry charts. */
export function DashboardAiMetrics({ simulation = false }: Readonly<{ simulation?: boolean }> = {}): ReactNode {
  const [charts, setCharts] = useState<PrometheusChartData[]>([]);
  const [failedCharts, setFailedCharts] = useState<string[]>([]);
  const [kpis, setKpis] = useState<AdminAiKpisResponse | null>(null);
  const [month, setMonth] = useState(getCurrentMonth);
  const [simulationUsers, setSimulationUsers] = useState('');
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setFailedCharts([]);
    void getPrometheusAiCharts(controller.signal)
      .then((result) => {
        setCharts(result.charts);
        setFailedCharts(result.failures);
      })
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
  const simulationTargetUsers = Number(simulationUsers);
  const simulationScale = simulation
    ? getSimulationScale(simulationUsers, kpis?.active_users.value ?? null)
    : null;
  const displayKpis = simulation && simulationScale !== null && kpis
    ? scaleAiKpis(kpis, simulationScale, simulationTargetUsers)
    : kpis;
  const displayCharts = simulation && simulationScale !== null
    ? scalePrometheusCharts(
      charts.filter(({ chart }) => !['ai-request-rate', 'ai-chat-outcomes'].includes(chart.id)),
      simulationScale,
    )
    : charts;

  return (
    <div className="dashboard-ai-metrics" aria-label="Observabilidade Midas AI">
      <p className="dashboard-ai-metrics__description">
        {simulation
          ? 'Projeções proporcionais baseadas nos KPIs selecionados e nas séries atuais do Prometheus.'
          : 'Custos, tokens, latências, tempo total e erros do mês selecionado; usuários ativos vêm do snapshot Analytics.'}
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
      {simulation && (
        <section className="dashboard-ai-metrics__simulacao" aria-labelledby="ai-simulation-title">
          <div className="dashboard-ai-metrics__simulacao-intro">
            <h2 id="ai-simulation-title">Cenário de usuários</h2>
            <p>
              Informe o total de usuários que deseja simular. Custos, tokens e uso de agentes/tools são estimados proporcionalmente à base atual; a latência permanece observada.
            </p>
          </div>
          <label className="dashboard-ai-metrics__simulacao-campo">
            Usuários na simulação
            <input
              aria-label="Usuários na simulação"
              type="number"
              min="1"
              max={Number.MAX_SAFE_INTEGER}
              step="1"
              value={simulationUsers}
              onChange={(event) => setSimulationUsers(event.target.value)}
            />
          </label>
          {simulationScale === null ? (
            <p className="dashboard-ai-metrics__simulacao-resultado" role="status">
              {kpis?.active_users.value === null || kpis?.active_users.value === undefined
                ? 'Não é possível projetar sem a contagem atual de usuários no snapshot Analytics.'
                : 'Informe um número inteiro positivo para a quantidade de usuários a simular.'}
            </p>
          ) : (
            <output className="dashboard-ai-metrics__simulacao-resultado" aria-live="polite">
              Simulação para {new Intl.NumberFormat('pt-BR').format(simulationTargetUsers)} usuários
              (base atual: {new Intl.NumberFormat('pt-BR').format(kpis?.active_users.value ?? 0)}).
            </output>
          )}
        </section>
      )}
      {kpiLoading && <output className="dashboard-ai-metrics__info">Carregando KPIs de IA…</output>}
      {kpiError && <p role="alert" className="dashboard-ai-metrics__info">{kpiError}</p>}
      {!kpiLoading && !kpiError && (!simulation || simulationScale !== null) && (
        <div className="dashboard-ai-metrics__kpis">
          <KpiCard label={simulation ? 'Custo estimado de tokens' : 'Custo de tokens'} item={displayKpis?.token_spend} showUnit={false} />
          <KpiCard label={simulation ? 'Tokens estimados' : 'Tokens no mês'} item={displayKpis?.total_tokens} />
          <KpiCard label="Custo por 1k tokens" item={displayKpis?.unit_cost} />
          <KpiCard label={simulation ? 'Base simulada' : 'Usuários ativos (snapshot)'} item={displayKpis?.active_users} />
          {!simulation && (
            <>
              <KpiCard label="Duração média de execução dos agentes" item={displayKpis?.inter_agent_latency} unavailableLabel="N/D" />
              <KpiCard label="Latência média de resposta" item={displayKpis?.average_response_latency} unavailableLabel="N/D" />
              <KpiCard label="Tempo acumulado das respostas do chat" item={displayKpis?.total_response_time} unavailableLabel="N/D" />
              <KpiCard label="Taxa de erros 5xx do chat" item={displayKpis?.error_rate} unavailableLabel="N/D" />
              <KpiCard label="Custo por resolução" item={displayKpis?.cost_per_resolution} unavailableLabel="N/D" />
              <KpiCard label="ROI estimado (valor do usuário/ecossistema; não ROI financeiro da Ouros)" item={displayKpis?.estimated_roi} unavailableLabel="N/D" />
            </>
          )}
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
      {!error && charts.length > 0 && (!simulation || simulationScale !== null) && (
        <div className="dashboard-ai-metrics__charts-grid">
          {displayCharts.map((chart, index) => (
            <AiChart
              key={chart.chart.id}
              chart={chart}
              color={chartColors[index % chartColors.length]}
              simulation={simulation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
