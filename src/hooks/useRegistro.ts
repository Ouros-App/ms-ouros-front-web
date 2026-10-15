import { useEffect, useState } from 'react';
import { obterRegistro } from '@/services/registroService';
import type { Registro, RegistrosStatus } from '@/types/registros.types';
import { isAbortError } from '@/utils/delay';

export function useRegistro(id: string | undefined) {
    const [registro, setRegistro] = useState<Registro | null>(null);
    const [status, setStatus] = useState<RegistrosStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    
    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();
        setStatus('carregando');
        
        obterRegistro(id, controller.signal)
        .then((dado) => {
            setRegistro(dado);
            setStatus('pronto');
        })
        .catch((error: unknown) => {
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar o registro.');
            setStatus('erro');
        });
        return () => controller.abort();
    }, [id]);
    return { registro, status, mensagemErro };
}