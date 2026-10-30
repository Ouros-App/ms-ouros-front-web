import { useCallback, useEffect, useState } from 'react';
import { getCorporateFilters } from '@/services/telemetryDashboardService';
import type { FiltrosDashboard, OpcoesFiltrosCorporativos } from '@/types/dashboard.types';
import { filtrosValidos } from '@/utils/dashboard';
import { isAbortError } from '@/utils/delay';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';

const CHAVE_FILTROS = 'ouros:dashboard-filtros';

export function useFiltrosDashboard() {
  const [filtros, setFiltrosEstado] = useState<FiltrosDashboard>(() =>
    filtrosValidos(lerArmazenado<FiltrosDashboard>(CHAVE_FILTROS)),
  );
  const [opcoes, setOpcoes] = useState<OpcoesFiltrosCorporativos | null>(null);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setCarregandoOpcoes(true);

    getCorporateFilters(controller.signal)
      .then((resultado) => {
        setOpcoes(resultado);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        console.warn('Não foi possível carregar as opções de filtros corporativos:', error);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCarregandoOpcoes(false);
        }
      });

    return () => controller.abort();
  }, []);

  const setFiltros = useCallback((novos: FiltrosDashboard) => {
    const validos = filtrosValidos(novos);
    setFiltrosEstado(validos);
    salvarArmazenado(CHAVE_FILTROS, validos);
  }, []);

  return { filtros, setFiltros, opcoes, carregandoOpcoes };
}
