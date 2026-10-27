import { useCallback, useEffect, useState } from 'react';
import { getCorporateKpis } from '@/services/telemetryDashboardService';
import type { CorporateKpisResponse, DashboardStatus, FiltrosDashboard } from '@/types/dashboard.types';
import { isAbortError } from '@/utils/delay';

export function useIndicadoresDashboard(filtros: FiltrosDashboard) {
  const [indicadores, setIndicadores] = useState<CorporateKpisResponse | null>(null);
  const [status, setStatus] = useState<DashboardStatus>('carregando');
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const { periodo, estado, gerencia } = filtros;

  useEffect(() => {
    const controller = new AbortController();
    setStatus('carregando');

    getCorporateKpis({ periodo, estado, gerencia }, controller.signal)
      .then((dados) => {
        setIndicadores(dados);
        setStatus('pronto');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setMensagemErro(
          error instanceof Error ? error.message : 'Não foi possível carregar os indicadores corporativos.',
        );
        setStatus('erro');
      });

    return () => controller.abort();
  }, [periodo, estado, gerencia, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  return { indicadores, status, mensagemErro, recarregar };
}
