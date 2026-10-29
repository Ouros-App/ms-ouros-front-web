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

export default function DashboardPage() {
  const { user } = useAuth();
  const { empresaSelecionada } = useAdminEnterprise();
  const { filtros, setFiltros, opcoes, carregandoOpcoes } = useFiltrosDashboard();
  const indicadores = useIndicadoresDashboard(filtros);
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
            <h1 className="dashboard-page__titulo">Dashboard Corporativo</h1>
            <p className="dashboard-page__subtitulo">
              Acompanhamento integrado de custos, energia, água e mortalidade
            </p>
          </div>

          <div className="dashboard-page__topo-acoes">
            <SeletorEmpresaAdm />
            <PerfilUsuario />
          </div>
        </header>

        <main id="conteudo-principal" className="dashboard-page__conteudo" tabIndex={-1}>
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

          <GraficosDashboard filtros={filtros} />

          {/* Tabela Corporativa de Granjas integrada ao Telemetry Service */}
          <DashboardFarmsTable enterpriseId={empresaSelecionada} />

          {/* Painel de Métricas de IA Midas exclusivo para ADM */}
          {isAdmin && <DashboardAiMetrics enterpriseId={empresaSelecionada} />}
        </main>
      </div>
    </div>
  );
}
