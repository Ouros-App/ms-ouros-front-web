import { usePagedList } from '@/hooks/usePagedList';
import { Pagination } from '@/components/common/Pagination';
import { useCallback, useEffect, useState } from 'react';
import {
  getAdminAiKpis,
  getAdminAiTokenSpend,
  getAdminAiLatency,
  getAdminAiSessionsPage,
  type AdminAiKpisResponse,
  type AdminAiTokenSpendResponse,
  type AdminAiLatencyResponse,
} from '@/services/adminAiMetricsService';
import { isAbortError } from '@/utils/delay';
import './DashboardAiMetrics.css';

interface DashboardAiMetricsProps {
  enterpriseId?: number | null;
}

export function DashboardAiMetrics({ enterpriseId }: DashboardAiMetricsProps) {
  const [kpis, setKpis] = useState<AdminAiKpisResponse | null>(null);
  const [spend, setSpend] = useState<AdminAiTokenSpendResponse | null>(null);
  const [latency, setLatency] = useState<AdminAiLatencyResponse | null>(null);
  const loadSessions = useCallback((page: number, size: number, signal: AbortSignal) =>
    getAdminAiSessionsPage({ page, size }, enterpriseId ?? undefined, signal), [enterpriseId]);
  const sessions = usePagedList(loadSessions);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true);

    Promise.all([
      getAdminAiKpis(enterpriseId ?? undefined, controller.signal),
      getAdminAiTokenSpend(enterpriseId ?? undefined, controller.signal),
      getAdminAiLatency(enterpriseId ?? undefined, controller.signal),
    ])
      .then(([resKpi, resSpend, resLat]) => {
        setKpis(resKpi);
        setSpend(resSpend);
        setLatency(resLat);
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        console.warn('Falha ao carregar métricas de IA:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [enterpriseId]);


  return (
    <section className="dashboard-ai-metrics" aria-label="Métricas de IA e Observabilidade Midas">
      {kpis?.tokenSpend && <><header className="dashboard-ai-metrics__header">
        <div>
          <h2 className="dashboard-ai-metrics__title">🤖 Observabilidade Midas IA & LLMs</h2>
          <p className="dashboard-ai-metrics__subtitle">
            Consumo de tokens, latência de inferência e auditoria de prompts (Figma 6052:1721)
          </p>
        </div>
        <span className="dashboard-ai-metrics__badge">Acurácia Geral: {kpis.avgAccuracyPercent}%</span>
      </header>

      <div className="dashboard-ai-metrics__kpis">
        <div className="dashboard-ai-metrics__kpi-card">
          <span className="dashboard-ai-metrics__kpi-label">{kpis.tokenSpend.label}</span>
          <strong className="dashboard-ai-metrics__kpi-value">{kpis.tokenSpend.formattedValue}</strong>
          <span className="dashboard-ai-metrics__kpi-sub">{kpis.tokenSpend.periodComparisonText}</span>
        </div>
        <div className="dashboard-ai-metrics__kpi-card">
          <span className="dashboard-ai-metrics__kpi-label">{kpis.unitTokenCost.label}</span>
          <strong className="dashboard-ai-metrics__kpi-value">{kpis.unitTokenCost.formattedValue}</strong>
          <span className="dashboard-ai-metrics__kpi-sub">{kpis.unitTokenCost.periodComparisonText}</span>
        </div>
        <div className="dashboard-ai-metrics__kpi-card">
          <span className="dashboard-ai-metrics__kpi-label">{kpis.activeUsers.label}</span>
          <strong className="dashboard-ai-metrics__kpi-value">{kpis.activeUsers.formattedValue}</strong>
          <span className="dashboard-ai-metrics__kpi-sub">{kpis.activeUsers.periodComparisonText}</span>
        </div>
      </div>

      <div className="dashboard-ai-metrics__grid">
        {spend && (
          <div className="dashboard-ai-metrics__panel">
            <h3 className="dashboard-ai-metrics__panel-title">{spend.title}</h3>
            <p className="dashboard-ai-metrics__panel-meta">Total de Tokens: {spend.totalTokens.toLocaleString('pt-BR')}</p>
            <div className="dashboard-ai-metrics__cohorts">
              {spend.points.slice(0, 4).map((pt) => (
                <div key={pt.cohort} className="dashboard-ai-metrics__cohort-row">
                  <span>{pt.cohort}</span>
                  <strong>R$ {pt.totalSpendBrl.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {latency && (
          <div className="dashboard-ai-metrics__panel">
            <h3 className="dashboard-ai-metrics__panel-title">{latency.title}</h3>
            <p className="dashboard-ai-metrics__panel-meta">
              P50: {latency.p50Ms}ms · P95: {latency.p95Ms}ms · Custo médio: R$ {latency.avgCostPerPromptBrl.toFixed(2)}
            </p>
            <div className="dashboard-ai-metrics__buckets">
              {latency.buckets.map((b) => (
                <div key={b.bucket} className="dashboard-ai-metrics__bucket-item">
                  <span>{b.bucket}</span>
                  <div className="dashboard-ai-metrics__progress">
                    <div className="dashboard-ai-metrics__bar" style={{ width: `${b.sharePercent}%` }} />
                  </div>
                  <span>{b.sharePercent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      </>}
      {carregando && <p role="status">Carregando telemetria Midas IA...</p>}
      {sessions.status === 'carregando' && <p role="status">Carregando sessões...</p>}
      {sessions.status === 'erro' && <div role="alert"><p>{sessions.mensagemErro}</p><button type="button" onClick={sessions.recarregar}>Tentar novamente</button></div>}
      {sessions.status === 'pronto' && sessions.items.length === 0 && <p role="status">Nenhuma sessão encontrada.</p>}
      {sessions.status === 'pronto' && sessions.items.length > 0 && (
        <div className="dashboard-ai-metrics__sessions">
          <h3 className="dashboard-ai-metrics__panel-title">Auditoria de Sessões Midas</h3>
          <div className="dashboard-ai-metrics__table-wrapper">
            <table className="dashboard-ai-metrics__table">
              <thead>
                <tr>
                  <th>Sessão</th>
                  <th>Modelo</th>
                  <th>Usuário</th>
                  <th>Tokens</th>
                  <th>Latência</th>
                  <th>Custo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.items.map((s) => (
                  <tr key={s.session_id}>
                    <td>{s.session_id}</td>
                    <td>{s.model}</td>
                    <td>{s.user_name}</td>
                    <td>{s.total_tokens}</td>
                    <td>{s.latency_ms}ms</td>
                    <td>R$ {s.cost_brl.toFixed(2)}</td>
                    <td><span className="dashboard-ai-metrics__status">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination {...sessions.pagination} />
    </section>
  );
}
