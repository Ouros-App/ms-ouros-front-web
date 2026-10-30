import { useCallback, useEffect, useState } from 'react';
import { obterIndicadoresSimulacao } from '@/services/indicadoresService';
import type { IndicadoresSimulacao, IndicadoresStatus } from '@/types/simulacoes.types';
import { isAbortError } from '@/utils/delay';

export function useIndicadoresSimulacao() {
    const [indicadores, setIndicadores] = useState<IndicadoresSimulacao | null>(null);
    const [status, setStatus] = useState<IndicadoresStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [tentativa, setTentativa] = useState(0);
    
    useEffect(() => {
        const controller = new AbortController();
        setStatus('carregando');
        
        obterIndicadoresSimulacao(controller.signal)
        .then((dados) => {
            setIndicadores(dados);
            setStatus('pronto');
        })
        .catch((error: unknown) => {
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar os indicadores.');
            setStatus('erro');
        });
        
        return () => controller.abort();
        }, [tentativa]);
        
        const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
        return { indicadores, status, mensagemErro, recarregar };
}