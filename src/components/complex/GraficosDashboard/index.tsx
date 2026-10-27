import { PainelGrafico } from '@/components/complex/PainelGrafico';
import { useGraficoTelemetry } from '@/hooks/useGraficosTelemetry';
import type { GraficosDashboardProps } from '@/types/dashboard.types';
import { CostByCohortChart } from './charts/CostByCohortChart';
import { CostByRegionChart } from './charts/CostByRegionChart';
import { CostDistributionDonutChart } from './charts/CostDistributionDonutChart';
import { MonthlyCostChart } from './charts/MonthlyCostChart';
import './GraficosDashboard.css';

export function GraficosDashboard({ filtros }: GraficosDashboardProps) {
  const custo = useGraficoTelemetry('cost-distribution-buckets', filtros);
  const custoPorLote = useGraficoTelemetry('cost-by-lot-size-cohort', filtros);
  const custoPorRegiao = useGraficoTelemetry('cost-by-region', filtros);
  const custoMensal = useGraficoTelemetry('monthly-cost', filtros);

  return (
    <div className="graficos-dashboard">
      <PainelGrafico
        titulo="Custo"
        status={custo.status}
        mensagemErro={custo.mensagemErro}
        onRecarregar={custo.recarregar}
      >
        {custo.dados && <CostDistributionDonutChart dados={custo.dados} />}
      </PainelGrafico>

      <PainelGrafico
        titulo="Custo por lote"
        status={custoPorLote.status}
        mensagemErro={custoPorLote.mensagemErro}
        onRecarregar={custoPorLote.recarregar}
      >
        {custoPorLote.dados && <CostByCohortChart dados={custoPorLote.dados} />}
      </PainelGrafico>

      <PainelGrafico
        titulo="Custo por região"
        status={custoPorRegiao.status}
        mensagemErro={custoPorRegiao.mensagemErro}
        onRecarregar={custoPorRegiao.recarregar}
      >
        {custoPorRegiao.dados && <CostByRegionChart dados={custoPorRegiao.dados} />}
      </PainelGrafico>

      <PainelGrafico
        titulo="Custo mensal"
        status={custoMensal.status}
        mensagemErro={custoMensal.mensagemErro}
        onRecarregar={custoMensal.recarregar}
      >
        {custoMensal.dados && <MonthlyCostChart dados={custoMensal.dados} />}
      </PainelGrafico>
    </div>
  );
}
