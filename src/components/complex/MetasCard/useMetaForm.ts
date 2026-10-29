import { useState } from 'react';
import type { MetaEdicao, MetaErros, MetaEstadual, MetaValores } from '@/types/metas.types';
import { validateMeta } from '@/utils/metasValidators';
import { sanitizeText } from '@/utils/sanitizers';

export function useMetaForm(meta: MetaEstadual){
    const [values, setValues] = useState<MetaValores>({
        meta: meta.meta,
        totalGranjas: String(meta.totalGranjas),
        concluidos: String(meta.concluidos),
    });
    
    const [errors, setErrors] = useState<MetaErros>({});
    const change = (campo: keyof MetaValores, valor: string) =>{
        setValues((atual) => ({ ...atual, [campo]: valor }));
        setErrors((atual) => ({ ...atual, [campo]: undefined }));
    };
    
    const validar = (): MetaEdicao | null =>{
        const encontrados = validateMeta(values)
        setErrors(encontrados);
        
        const primeiro = (Object.keys(encontrados) as (keyof MetaValores)[])[0];
        if (primeiro){
            document.getElementById(`meta-${primeiro}`)?.focus();
            return null;
        }

        return{
            meta: sanitizeText(values.meta.trim()),
            totalGranjas: Number(values.totalGranjas),
            concluidos: Number(values.concluidos),
        };
    };
    
    return { values, errors, change, validar };
}