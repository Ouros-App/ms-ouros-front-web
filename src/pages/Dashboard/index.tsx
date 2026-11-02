import { useState } from 'react';
import { DashboardAiMetrics } from '@/components/complex/DashboardAiMetrics';
import { DashboardFarmsTable } from '@/components/complex/DashboardFarmsTable';
import { FiltrosDashboard } from '@/components/complex/FiltrosDashboard';
import { GraficosDashboard } from '@/components/complex/GraficosDashboard';
import { KpisDashboard } from '@/components/complex/KpisDashboards';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { Sidebar } from '@/components/complex/Sidebar';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { useAuth } from '@/hooks/useAuth';
import { useFiltrosDashboard } from '@/hooks/useFiltrosDashboard';
import { useIndicadoresDashboard } from '@/hooks/useIndicadoresDashboard';
import { asaFundo } from './dashboardAssets';
import './Dashboard.css';

type AbaDashboard = 'operacional' | 'ia';

/** Renders operational dashboards and the admin-only AI metrics tab. */
export default function DashboardPage() {
  const { user } = useAuth();
  const { empresaSelecionada } = useAdminEnterprise();
  const { filtros, setFiltros, opcoes, carregandoOpcoes } = useFiltrosDashboard();
  const [abaAtiva, setAbaAtiva] = useState<AbaDashboard>('operacional');

  const filtrosEfetivos = {
    ...filtros,
    enterpriseId: empresaSelecionada,
  };
  const indicadores = useIndicadoresDashboard(filtrosEfetivos);
  const isAdmin = user?.role === 'admin' || user?.accountType === 'admin';

  return (
    <div className="dashboard-page">
      <a href="#conteudo-principal" className="dashboard-page__pular">
        Pular para o conteúdo
      </a>

      <Sidebar />

      <div className="dashboard-page__coluna">
        {asaFundo && <img src={asaFundo} alt="" className="dashboard-page__fundo" />}

        <header className="dashboard-page__topo">
          <div>
            <h1 className="dashboard-page__titulo">
              {abaAtiva === 'ia' && isAdmin ? 'Dashboard - Métricas' : 'Dashboard Corporativo'}
            </h1>
            <p className="dashboard-page__subtitulo">
              {abaAtiva === 'ia' && isAdmin
                ? 'Painel de observabilidade técnica e financeira de Inteligência Artificial e LLMs'
                : 'Acompanhamento integrado de custos, energia, água e mortalidade'}
            </p>
          </div>

          <div className="dashboard-page__topo-acoes">
            <SeletorEmpresaAdm />
            <PerfilUsuario />
          </div>
        </header>

        <main id="conteudo-principal" className="dashboard-page__conteudo" tabIndex={-1}>
          {/* Opção secundária para escolher o gerenciamento de IA para ADM */}
          {isAdmin && (
            <div className="dashboard-page__abas" role="tablist" aria-label="Seletor de visão do Dashboard">
              <button
                type="button"
                role="tab"
                id="aba-operacional"
                aria-selected={abaAtiva === 'operacional'}
                aria-controls="painel-operacional"
                className={`dashboard-page__aba-btn ${abaAtiva === 'operacional' ? 'dashboard-page__aba-btn--ativo' : ''}`}
                onClick={() => setAbaAtiva('operacional')}
              >
                <svg
                  className="dashboard-page__aba-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
                Operacional & Granjas
              </button>

              <button
                type="button"
                role="tab"
                id="aba-ia"
                aria-selected={abaAtiva === 'ia'}
                aria-controls="painel-ia"
                className={`dashboard-page__aba-btn ${abaAtiva === 'ia' ? 'dashboard-page__aba-btn--ativo' : ''}`}
                onClick={() => setAbaAtiva('ia')}
              >
                <svg
                  className="dashboard-page__aba-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3" />
                  <path d="M15 1v3" />
                  <path d="M9 20v3" />
                  <path d="M15 20v3" />
                  <path d="M20 9h3" />
                  <path d="M20 14h3" />
                  <path d="M1 9h3" />
                  <path d="M1 14h3" />
                </svg>
                Gerenciamento de IA
              </button>
            </div>
          )}

          {/* Conteúdo da Aba 1: Operacional & Granjas */}
          {(!isAdmin || abaAtiva === 'operacional') && (
            <div id="painel-operacional" role="tabpanel" aria-labelledby="aba-operacional">
              <FiltrosDashboard
                filtros={filtros}
                opcoes={opcoes}
                carregandoOpcoes={carregandoOpcoes}
                onAlterar={setFiltros}
              />
              <KpisDashboard
                indicadores={indicadores.indicadores}
                status={indicadores.status}
                mensagemErro={indicadores.mensagemErro}
                onRecarregar={indicadores.recarregar}
              />

              <GraficosDashboard filtros={filtrosEfetivos} />

              {/* Tabela Corporativa de Granjas integrada ao Telemetry Service */}
              <DashboardFarmsTable
                enterpriseId={empresaSelecionada}
                state={filtros.estado !== 'todos' ? filtros.estado : undefined}
                management={filtros.gerencia !== 'todas' && filtros.gerencia !== 'Todas' ? filtros.gerencia : undefined}
                period={filtros.periodo !== 'todos' ? filtros.periodo : undefined}
              />
            </div>
          )}

          {/* Conteúdo da Aba 2: Gerenciamento de IA (Figma 6052:1721) */}
          {isAdmin && abaAtiva === 'ia' && (
            <div id="painel-ia" role="tabpanel" aria-labelledby="aba-ia">
              <DashboardAiMetrics />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
