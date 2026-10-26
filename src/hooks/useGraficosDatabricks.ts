import { useCallback, useEffect, useState } from 'react';
import { obterGraficoDatabricks } from '@/services/databricksService';
import type { DadosGraficos, FiltrosDashboard, GraficoId, GraficoStatus } from '@/types/dashboard.types';
import { DATABRICKS_ATIVO } from '@/utils/databrics';
import { isAbortError } from '@/utils/delay';

export function useGraficoDatabricks<K extends GraficoId>(id: K, filtros: FiltrosDashboard){
    const [dados, setDados] = useState<DadosGraficos[K] | null>(null);
    const [status, setStatus] = useState<GraficoStatus>(DATABRICKS_ATIVO ? 'carregando' : 'aguardando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [tentativa, setTentativa] = useState(0);
    const { periodo, estado } = filtros;
    
    useEffect(() =>{
        if (!DATABRICKS_ATIVO) return;
        const controller = new AbortController();
        setStatus('carregando');

        obterGraficoDatabricks(id, { periodo, estado }, controller.signal)
        .then((resultado) =>{ setDados(resultado); setStatus('pronto'); })
        .catch((error: unknown) =>{
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar o gráfico.');
            setStatus('erro');
        });
        
        return () => controller.abort();
    }, [id, periodo, estado, tentativa]);
    
    const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
    return { dados, status, mensagemErro, recarregar };
}