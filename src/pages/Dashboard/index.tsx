import { FiltrosDashboard } from '@/components/complex/FiltrosDashboard';
import { GraficosDashboard } from '@/components/complex/GraficosDashboard';
import { KpisDashboard } from '@/components/complex/KpisDashboards';
import { PerfilUsuario } from '@/components/complex/PerfilUsuario';
import { Sidebar } from '@/components/complex/Sidebar';
import { useFiltrosDashboard } from '@/hooks/useFiltrosDashboard';
import { useIndicadoresDashboard } from '@/hooks/useIndicadoresDashboard';
import { asaFundo } from './dashboardAssets';
import './Dashboard.css';

export default function DashboardPage() {
  const { filtros, setFiltros, opcoes, carregandoOpcoes } = useFiltrosDashboard();
  const indicadores = useIndicadoresDashboard(filtros);

  return (
    <div className="dashboard-page">
      <a href="#conteudo-principal" className="dashboard-page__pular">
        Pular para o conteúdo
      </a>

      <Sidebar />

      <div className="dashboard-page__coluna">
        {asaFundo && <img src={asaFundo} alt="" className="dashboard-page__fundo" />}

        <header className="dashboard-page__topo">
          <h1 className="dashboard-page__titulo">Dashboard</h1>

          <PerfilUsuario />
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
        </main>
      </div>
    </div>
  );
}
