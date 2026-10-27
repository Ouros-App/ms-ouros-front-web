import { KpiCard } from '@/components/complex/KpiCard';
import type { CorporateKpisResponse, IndicadoresDashboard, KpisDashboardProps } from '@/types/dashboard.types';
import { itensKpis } from './kpiItens';
import './KpisDashboard.css';

function isCorporateKpis(
  data: CorporateKpisResponse | IndicadoresDashboard,
): data is CorporateKpisResponse {
  return 'spend_current_year' in data;
}

function extrairValorSemPrefixo(formatado: string, prefixo?: string): string {
  if (prefixo && formatado.startsWith(prefixo)) {
    return formatado.slice(prefixo.length).trim();
  }
  return formatado;
}

export function KpisDashboard({ indicadores, status, mensagemErro, onRecarregar }: KpisDashboardProps) {
  const anoAtual = new Date().getFullYear();

  if (status === 'erro') {
    return (
      <section className="kpis-dashboard kpis-dashboard--estado" aria-label="Indicadores do dashboard" role="alert">
        <p className="kpis-dashboard__mensagem">{mensagemErro}</p>
        <button type="button" className="kpis-dashboard__botao" onClick={onRecarregar}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (status === 'carregando' || !indicadores) {
    return (
      <section className="kpis-dashboard" aria-label="Indicadores do dashboard" aria-busy="true">
        <p className="kpis-dashboard__oculto" role="status">
          Carregando indicadores...
        </p>

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kpis-dashboard__esqueleto" aria-hidden="true" />
        ))}
      </section>
    );
  }

  if (isCorporateKpis(indicadores)) {
    const cards = [
      {
        chave: 'spend_current_year',
        rotulo: 'Total',
        prefixo: 'R$',
        valor: extrairValorSemPrefixo(indicadores.spend_current_year.formatted, 'R$'),
        descricao: `Gasto - ${indicadores.spend_current_year.year ?? anoAtual}`,
      },
      {
        chave: 'spend_previous_year',
        rotulo: 'Total',
        prefixo: 'R$',
        valor: extrairValorSemPrefixo(indicadores.spend_previous_year.formatted, 'R$'),
        descricao: `Gasto - ${indicadores.spend_previous_year.year ?? anoAtual - 1}`,
      },
      {
        chave: 'avg_cost_per_bird',
        rotulo: 'Custo',
        prefixo: 'R$',
        valor: extrairValorSemPrefixo(indicadores.avg_cost_per_bird.formatted, 'R$'),
        descricao: 'Reais / Ave',
      },
      {
        chave: 'total_lots',
        rotulo: 'Total',
        prefixo: undefined,
        valor: indicadores.total_lots.formatted,
        descricao: 'Lotes Ativos',
      },
    ];

    return (
      <section className="kpis-dashboard" aria-label="Indicadores do dashboard">
        {cards.map((card) => (
          <KpiCard
            key={card.chave}
            rotulo={card.rotulo}
            prefixo={card.prefixo}
            valor={card.valor}
            descricao={card.descricao}
          />
        ))}
      </section>
    );
  }

  return (
    <section className="kpis-dashboard" aria-label="Indicadores do dashboard">
      {itensKpis.map((item) => (
        <KpiCard
          key={item.chave}
          rotulo={item.rotulo}
          prefixo={item.prefixo}
          valor={item.formatar(indicadores[item.chave])}
          descricao={item.descricao(anoAtual)}
        />
      ))}
    </section>
  );
}
