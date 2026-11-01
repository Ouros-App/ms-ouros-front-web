import { useState } from 'react';
import type { MetaEdicao, MetaErros, MetaEstadual, MetaValores } from '@/types/metas.types';
import { validateMeta } from '@/utils/metasValidators';
import { sanitizeText } from '@/utils/sanitizers';

function normalizarStatusInicial(status?: string | null): string {
    if (!status) return 'PENDING';
    const s = status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
    if (['CONCLUIDA', 'CONCLUIDO', 'COMPLETED', 'ACHIEVED', 'FINALIZADA'].includes(s)) return 'COMPLETED';
    if (['EM ANDAMENTO', 'IN_PROGRESS'].includes(s)) return 'IN_PROGRESS';
    return 'PENDING';
}

export function useMetaForm(meta: MetaEstadual){
    const [values, setValues] = useState<MetaValores>({
        meta: meta.meta,
        totalGranjas: String(meta.totalGranjas),
        concluidos: '0',
        status: normalizarStatusInicial(meta.status),
    });
    
    const [errors, setErrors] = useState<MetaErros>({});
    const change = (campo: keyof MetaValores, valor: string) =>{
        setValues((atual) => ({ ...atual, [campo]: valor }));
        setErrors((atual) => ({ ...atual, [campo]: undefined }));
    };
    
    const validar = (): MetaEdicao | null =>{
        const encontrados = validateMeta(values);
        if (meta.type === 'TASK_COMPLETION') {
            delete encontrados.totalGranjas;
            delete encontrados.concluidos;
        }
        setErrors(encontrados);
        
        const primeiro = (Object.keys(encontrados) as (keyof MetaValores)[])[0];
        if (primeiro){
            document.getElementById(`meta-${primeiro}`)?.focus();
            return null;
        }

        return{
            type: meta.type,
            meta: sanitizeText(values.meta.trim()),
            totalGranjas: Number(values.totalGranjas),
            concluidos: Number(values.concluidos),
            status: values.status,
        };
    };
    
    return { values, errors, change, validar };
}