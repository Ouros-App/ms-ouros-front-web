import { useCallback, useEffect, useState } from 'react';
import { getCorporateChartData } from '@/services/telemetryDashboardService';
import type {
  CostByLotSizeCohort,
  CostByRegion,
  CostDistributionBucket,
  DadosGraficosCorporativos,
  FiltrosDashboard,
  GraficoStatus,
  MonthlyCost,
} from '@/types/dashboard.types';
import { isAbortError } from '@/utils/delay';

export function useGraficoTelemetry<K extends keyof DadosGraficosCorporativos>(
  id: K,
  filtros: FiltrosDashboard,
) {
  const [dados, setDados] = useState<DadosGraficosCorporativos[K] | null>(null);
  const [status, setStatus] = useState<GraficoStatus>('carregando');
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const { periodo, estado, gerencia } = filtros;

  useEffect(() => {
    const controller = new AbortController();
    setStatus('carregando');

    getCorporateChartData(id, { periodo, estado, gerencia }, controller.signal)
      .then((resultado) => {
        setDados(resultado);
        setStatus('pronto');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar o gráfico.');
        setStatus('erro');
      });

    return () => controller.abort();
  }, [id, periodo, estado, gerencia, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
  return { dados, status, mensagemErro, recarregar };
}

export interface GraficosCorporateData {
  costDistribution: CostDistributionBucket[] | null;
  costByCohort: CostByLotSizeCohort[] | null;
  costByRegion: CostByRegion[] | null;
  monthlyCost: MonthlyCost[] | null;
}

export function useGraficosTelemetryConjunto(filtros: FiltrosDashboard) {
  const [dados, setDados] = useState<GraficosCorporateData>({
    costDistribution: null,
    costByCohort: null,
    costByRegion: null,
    monthlyCost: null,
  });
  const [status, setStatus] = useState<GraficoStatus>('carregando');
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const { periodo, estado, gerencia } = filtros;

  useEffect(() => {
    const controller = new AbortController();
    setStatus('carregando');

    Promise.allSettled([
      getCorporateChartData('cost-distribution-buckets', { periodo, estado, gerencia }, controller.signal),
      getCorporateChartData('cost-by-lot-size-cohort', { periodo, estado, gerencia }, controller.signal),
      getCorporateChartData('cost-by-region', { periodo, estado, gerencia }, controller.signal),
      getCorporateChartData('monthly-cost', { periodo, estado, gerencia }, controller.signal),
    ]).then(([distRes, cohortRes, regionRes, monthRes]) => {
      if (controller.signal.aborted) return;

      setDados({
        costDistribution: distRes.status === 'fulfilled' ? distRes.value : null,
        costByCohort: cohortRes.status === 'fulfilled' ? cohortRes.value : null,
        costByRegion: regionRes.status === 'fulfilled' ? regionRes.value : null,
        monthlyCost: monthRes.status === 'fulfilled' ? monthRes.value : null,
      });

      const anySuccess =
        distRes.status === 'fulfilled' ||
        cohortRes.status === 'fulfilled' ||
        regionRes.status === 'fulfilled' ||
        monthRes.status === 'fulfilled';

      if (anySuccess) {
        setStatus('pronto');
      } else {
        setStatus('erro');
        setMensagemErro('Não foi possível carregar os gráficos corporativos.');
      }
    });

    return () => controller.abort();
  }, [periodo, estado, gerencia, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  return { dados, status, mensagemErro, recarregar };
}
