import type { MetaErros, MetaValores } from '@/types/metas.types';
import { isRequired } from './validators';

export const LIMITES_META ={
    tituloMin: 3,
    tituloMax: 80,
}as const;

export function validateTituloMeta(valor: string): string | null{
    const titulo = valor.trim();
    
    if (!isRequired(titulo)) return 'Informe a meta estadual.';
    if (titulo.length < LIMITES_META.tituloMin) return `A meta precisa ter pelo menos ${LIMITES_META.tituloMin} caracteres.`;
    if (titulo.length > LIMITES_META.tituloMax) return `A meta pode ter no máximo ${LIMITES_META.tituloMax} caracteres.`;
    return null;
}

export function validateMeta(values: MetaValores): MetaErros{
    const errors: MetaErros = {};
    const erroTitulo = validateTituloMeta(values.meta);
    if (erroTitulo) errors.meta = erroTitulo;
    const total = Number(values.totalGranjas);
    if (!isRequired(values.totalGranjas) || !Number.isInteger(total) || total < 1){
        errors.totalGranjas = 'Informe um número inteiro de granjas (1 ou mais).';
    }
    
    const concluidos = Number(values.concluidos);
    if (!isRequired(values.concluidos) || !Number.isInteger(concluidos) || concluidos < 0){
        errors.concluidos = 'Informe um número inteiro de concluídos (0 ou mais).';
    } 
    else if (!errors.totalGranjas && concluidos > total){
        errors.concluidos = 'Os concluídos não podem passar do total de granjas.';
    }
    
    return errors;
}