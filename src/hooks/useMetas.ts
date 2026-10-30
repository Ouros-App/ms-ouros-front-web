import { useCallback, useEffect, useMemo, useState } from 'react';
import { atualizarMeta, excluirMeta, lancarMetaEstadual, listarMetas } from '@/services/metas.Service';
import type { MetaEdicao, MetaEstadual, MetasStatus } from '@/types/metas.types';
import { isAbortError } from '@/utils/delay';
import { filtrarMetas } from '@/utils/metas';

export function useMetas(){
    const [todas, setTodas] = useState<MetaEstadual[]>([]);
    const [status, setStatus] = useState<MetasStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [busca, setBusca] = useState('');
    const [tentativa, setTentativa] = useState(0);
    
    useEffect(() =>{
        const controller = new AbortController();
        setStatus('carregando');
        
        listarMetas(controller.signal)
        .then((dados) =>{
            setTodas(dados);
            setStatus('pronto');
        })
        .catch((error: unknown) =>{
            if (controller.signal.aborted || isAbortError(error)) return;
            setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar as metas.');
            setStatus('erro');
        });
        
        return () => controller.abort();
    }, [tentativa]);
    
    const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
    const lancar = useCallback(async (titulo: string) =>{
        const criadas = await lancarMetaEstadual(titulo);
        setTodas((lista) => [...lista, ...criadas]);
        return criadas.length;
    },[]);
    
    const salvar = useCallback(async (id: string, dados: MetaEdicao) =>{
        const atualizada = await atualizarMeta(id, dados);
        setTodas((lista) => lista.map((m) => (m.id === id ? atualizada : m)));
    },[]);
    
    const excluir = useCallback(async (id: string) =>{
        await excluirMeta(id);
        setTodas((lista) => lista.filter((m) => m.id !== id));
    },[]);
    
    const metas = useMemo(() => filtrarMetas(todas, busca), [todas, busca]);
    return {todas, metas, status, mensagemErro, busca, setBusca, lancar, salvar, excluir, recarregar};
}