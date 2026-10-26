import { useCallback, useEffect, useState } from 'react';
import { obterIndicadoresDashboard } from '@/services/dashboardService';
import type { DashboardStatus, FiltrosDashboard, IndicadoresDashboard } from '@/types/dashboard.types';
import { isAbortError } from '@/utils/delay';

export function useIndicadoresDashboard(filtros: FiltrosDashboard){
    const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null);
    const [status, setStatus] = useState<DashboardStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [tentativa, setTentativa] = useState(0);
    const { periodo, estado } = filtros;
    
    useEffect(() =>{
        const controller = new AbortController();
        setStatus('carregando');
        obterIndicadoresDashboard({ periodo, estado }, controller.signal)

        .then((dados) =>{
            setIndicadores(dados);
            setStatus('pronto');
        })
        .catch((error: unknown) =>{
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar os indicadores.');
            setStatus('erro');
        });
        
        return () => controller.abort();
    }, [periodo, estado, tentativa]);
    
    const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
    return { indicadores, status, mensagemErro, recarregar };
}