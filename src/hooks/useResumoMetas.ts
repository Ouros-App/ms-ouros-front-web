import { useCallback, useEffect, useMemo, useState } from 'react';
import { obterResumoMetas } from '@/services/metas.Service';
import type { MetaEstadual, MetasStatus, ResumoMetas } from '@/types/metas.types';
import { isAbortError } from '@/utils/delay';
import { resumirMetas } from '@/utils/metas';
import { METAS_API_ATIVA } from '@/utils/metasApi';

export function useResumoMetas(metas: MetaEstadual[], statusMetas: MetasStatus){
    const [resumoApi, setResumoApi] = useState<ResumoMetas | null>(null);
    const [statusApi, setStatusApi] = useState<MetasStatus>('carregando');
    const [mensagemErro, setMensagemErro] = useState('');
    const [tentativa, setTentativa] = useState(0);
    const resumoLocal = useMemo(() => resumirMetas(metas), [metas]);
    
    useEffect(() =>{
        if (!METAS_API_ATIVA || statusMetas !== 'pronto') return;
        const controller = new AbortController();
        setStatusApi('carregando');
        
        obterResumoMetas(controller.signal)
            .then((dados) =>{
                setResumoApi(dados);
                setStatusApi('pronto');
            })
            .catch((error: unknown) =>{
                if (controller.signal.aborted || isAbortError(error)) return;
                setMensagemErro(error instanceof Error ? error.message : 'Não foi possível carregar o resumo das metas.');
                setStatusApi('erro');
            });
            
            return () => controller.abort();
        },[statusMetas, metas, tentativa]);
        
        const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
        if (!METAS_API_ATIVA){
            return{
                resumo: statusMetas === 'pronto' ? resumoLocal : null,
                status: statusMetas,
                mensagemErro: '',
                recarregar,
            };
        }
        
        return { resumo: resumoApi, status: statusMetas === 'pronto' ? statusApi : statusMetas, mensagemErro, recarregar };
    }