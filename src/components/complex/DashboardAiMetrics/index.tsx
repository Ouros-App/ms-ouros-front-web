import { useCallback, useEffect, useState } from 'react';
import { usePagedList } from '@/hooks/usePagedList';
import { Pagination } from '@/components/common/Pagination';
import {
  getAdminAiKpis,
  getAdminAiTokenSpend,
  getAdminAiTokenSpendComparative,
  getAdminAiRequestSpendComparative,
  getAdminAiCostByRegion,
  getAdminAiMonthlyCost,
  getAdminAiSessionsPage,
  type AdminAiKpisResponse,
  type AdminAiComparativeCohortPoint,
  type AdminAiRegionPoint,
  type AdminAiMonthlyPoint,
  FALLBACK_AI_KPIS,
  FALLBACK_AI_TOKEN_SPEND,
  FALLBACK_AI_REQUEST_SPEND,
  FALLBACK_AI_COST_BY_REGION,
  FALLBACK_AI_MONTHLY_COST,
} from '@/services/adminAiMetricsService';
import { AiTokenSpendChart } from './charts/AiTokenSpendChart';
import { AiRequestSpendChart } from './charts/AiRequestSpendChart';
import { AiCostByRegionChart } from './charts/AiCostByRegionChart';
import { AiMonthlyCostChart } from './charts/AiMonthlyCostChart';
import './DashboardAiMetrics.css';

interface DashboardAiMetricsProps {
  enterpriseId?: number | null;
}

export function DashboardAiMetrics({ enterpriseId }: DashboardAiMetricsProps) {
  const [kpis, setKpis] = useState<AdminAiKpisResponse>(FALLBACK_AI_KPIS);
  const [spendTitle, setSpendTitle] = useState<string | null>(null);
  const [tokenSpend, setTokenSpend] = useState<AdminAiComparativeCohortPoint[]>(FALLBACK_AI_TOKEN_SPEND);
  const [requestSpend, setRequestSpend] = useState<AdminAiComparativeCohortPoint[]>(FALLBACK_AI_REQUEST_SPEND);
  const [costByRegion, setCostByRegion] = useState<AdminAiRegionPoint[]>(FALLBACK_AI_COST_BY_REGION);
  const [monthlyCost, setMonthlyCost] = useState<AdminAiMonthlyPoint[]>(FALLBACK_AI_MONTHLY_COST);
  const [periodo, setPeriodo] = useState('atual');
  const [carregando, setCarregando] = useState(true);

  const loadSessions = useCallback(
    (page: number, size: number, signal: AbortSignal) =>
      getAdminAiSessionsPage({ page, size }, enterpriseId ?? undefined, signal),
    [enterpriseId],
  );
  const sessions = usePagedList(loadSessions);

  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true);

    Promise.allSettled([
      getAdminAiKpis(enterpriseId ?? undefined, controller.signal),
      getAdminAiTokenSpend(enterpriseId ?? undefined, controller.signal),
      getAdminAiTokenSpendComparative(enterpriseId ?? undefined, controller.signal),
      getAdminAiRequestSpendComparative(enterpriseId ?? undefined, controller.signal),
      getAdminAiCostByRegion(enterpriseId ?? undefined, controller.signal),
      getAdminAiMonthlyCost(enterpriseId ?? undefined, controller.signal),
    ])
      .then(([resKpi, resSpend, resToken, resReq, resReg, resMonth]) => {
        if (resKpi.status === 'fulfilled') setKpis(resKpi.value);
        if (resSpend.status === 'fulfilled') setSpendTitle(resSpend.value.title);
        if (resToken.status === 'fulfilled') setTokenSpend(resToken.value);
        if (resReq.status === 'fulfilled') setRequestSpend(resReq.value);
        if (resReg.status === 'fulfilled') setCostByRegion(resReg.value);
        if (resMonth.status === 'fulfilled') setMonthlyCost(resMonth.value);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [enterpriseId]);

  return (
    <div className="dashboard-ai-metrics" aria-label="Gerenciamento de IA e Observabilidade Midas">
      {carregando && <p role="status">Carregando telemetria Midas IA...</p>}

      {/* Controles do topo do painel de IA */}
      <div className="dashboard-ai-metrics__controles">
        <div className="dashboard-ai-metrics__periodo-box">
          <select
            id="ai-periodo-select"
            className="dashboard-ai-metrics__select"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            aria-label="Filtrar métricas de IA por período"
          >
            <option value="atual">Mês Atual</option>
            <option value="ultimo-trimestre">Último Trimestre</option>
            <option value="ano-vigente">Ano Vigente (2025/2026)</option>
          </select>
          <svg
            className="dashboard-ai-metrics__select-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* 3 KPI Cards com estilo Figma #6052:1734 */}
      <div className="dashboard-ai-metrics__kpis-container">
        {/* Card 1: Gasto de Tokens */}
        <div className="dashboard-ai-metrics__kpi-card">
          <span className="dashboard-ai-metrics__kpi-tag">{kpis.tokenSpend.comparisonLabel}</span>
          <div className="dashboard-ai-metrics__kpi-valor">{kpis.tokenSpend.formattedValue}</div>
          <div className="dashboard-ai-metrics__kpi-label">{kpis.tokenSpend.label}</div>
        </div>

        {/* Card 2: Reais/Token */}
        <div className="dashboard-ai-metrics__kpi-card">
          <span className="dashboard-ai-metrics__kpi-tag">{kpis.unitTokenCost.comparisonLabel}</span>
          <div className="dashboard-ai-metrics__kpi-valor">{kpis.unitTokenCost.formattedValue}</div>
          <div className="dashboard-ai-metrics__kpi-label">{kpis.unitTokenCost.label}</div>
        </div>

        {/* Card 3: Usuários */}
        <div className="dashboard-ai-metrics__kpi-card">
          <span className="dashboard-ai-metrics__kpi-tag">{kpis.activeUsers.comparisonLabel}</span>
          <div className="dashboard-ai-metrics__kpi-valor">{kpis.activeUsers.formattedValue}</div>
          <div className="dashboard-ai-metrics__kpi-label">{kpis.activeUsers.label}</div>
        </div>
      </div>

      {/* Grid 2x2 com os 4 Gráficos do Figma 6052:1721 */}
      <div className="dashboard-ai-metrics__charts-grid">
        {/* Gráfico 1: Gasto de tokens / Gasto por modelo */}
        <section className="dashboard-ai-metrics__chart-card" aria-label="Gasto de tokens">
          <h2 className="dashboard-ai-metrics__chart-title">{spendTitle ?? 'Gasto de tokens'}</h2>
          <AiTokenSpendChart dados={tokenSpend} />
        </section>

        {/* Gráfico 2: Gasto por requisição */}
        <section className="dashboard-ai-metrics__chart-card" aria-label="Gasto por requisição">
          <h2 className="dashboard-ai-metrics__chart-title">Gasto por requisição</h2>
          <AiRequestSpendChart dados={requestSpend} />
        </section>

        {/* Gráfico 3: Custo por região */}
        <section className="dashboard-ai-metrics__chart-card" aria-label="Custo por região">
          <h2 className="dashboard-ai-metrics__chart-title">Custo por região</h2>
          <AiCostByRegionChart dados={costByRegion} />
        </section>

        {/* Gráfico 4: Custo mensal */}
        <section className="dashboard-ai-metrics__chart-card" aria-label="Custo mensal">
          <h2 className="dashboard-ai-metrics__chart-title">Custo mensal</h2>
          <AiMonthlyCostChart dados={monthlyCost} />
        </section>
      </div>

      {/* Auditoria de Sessões Midas IA */}
      <section className="dashboard-ai-metrics__sessions" aria-label="Auditoria de Sessões do Midas IA">
        <header className="dashboard-ai-metrics__sessions-header">
          <div>
            <h2 className="dashboard-ai-metrics__chart-title">Auditoria de Sessões Midas</h2>
            <p className="dashboard-ai-metrics__sessions-subtitle">
              Registro operacional de inferência, tokens consumidos e acurácia ({sessions.pagination.totalElements} interações registradas)
            </p>
          </div>
        </header>

        {sessions.status === 'carregando' && (
          <p role="status" className="dashboard-ai-metrics__info">Carregando sessões...</p>
        )}
        {sessions.status === 'erro' && (
          <div role="alert" className="dashboard-ai-metrics__info">
            <p>{sessions.mensagemErro}</p>
            <button type="button" className="dashboard-ai-metrics__btn" onClick={sessions.recarregar}>
              Tentar novamente
            </button>
          </div>
        )}
        {sessions.status === 'pronto' && sessions.items.length === 0 && (
          <p role="status" className="dashboard-ai-metrics__info">Nenhuma sessão encontrada.</p>
        )}
        {sessions.status === 'pronto' && sessions.items.length > 0 && (
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
                  <th>Acurácia</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.items.map((s) => (
                  <tr key={s.session_id}>
                    <td className="dashboard-ai-metrics__table-strong">{s.session_id}</td>
                    <td>{s.model}</td>
                    <td>{s.user_name}</td>
                    <td>{s.total_tokens.toLocaleString('pt-BR')}</td>
                    <td>{s.latency_ms}ms</td>
                    <td>R$ {s.cost_brl.toFixed(2)}</td>
                    <td>{s.accuracy_rate ? `${s.accuracy_rate}%` : '100%'}</td>
                    <td>
                      <span className={`dashboard-ai-metrics__status-badge dashboard-ai-metrics__status-badge--${s.status}`}>
                        {s.status === 'success' ? 'Sucesso' : s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination {...sessions.pagination} />
      </section>
    </div>
  );
}
