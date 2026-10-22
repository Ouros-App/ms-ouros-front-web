import { useState } from 'react';
import type { Simulacao, SimulacaoErros, SimulacaoNova, SimulacaoValores } from '@/types/simulacoes.types';
import { sanitizeText } from '@/utils/sanitizers';
import { validateSimulacao } from '@/utils/simulacaoValidators';

const vazio: SimulacaoValores = {idLote: '', consumoAtual: '', consumoAlvo: '', precoAgua: '',  precoEnergia: '', quantidadeAves: '', gastoAlvoEnergia: '', };

function iniciais(simulacao: Simulacao | null): SimulacaoValores {
    if (!simulacao) return vazio;
    return { idLote: simulacao.idLote, consumoAtual: String(simulacao.consumoAtual), consumoAlvo: String(simulacao.consumoAlvo), precoAgua: String(simulacao.precoAgua), precoEnergia: String(simulacao.precoEnergia), quantidadeAves: String(simulacao.quantidadeAves), gastoAlvoEnergia: String(simulacao.gastoAlvoEnergia),     
    };
}

export function useSimulacaoForm(simulacao: Simulacao | null) {
    const [values, setValues] = useState<SimulacaoValores>(() => iniciais(simulacao));
    const [errors, setErrors] = useState<SimulacaoErros>({});
    
    const change = (campo: keyof SimulacaoValores, valor: string) => {
        setValues((atual) => ({ ...atual, [campo]: valor }));
        setErrors((atual) => ({ ...atual, [campo]: undefined }));
    };
    
    const validar = (): SimulacaoNova | null => {
        const encontrados = validateSimulacao(values);
        setErrors(encontrados);
        
        const primeiro = (Object.keys(encontrados) as (keyof SimulacaoValores)[])[0];
        if (primeiro) {
            document.getElementById(`simulacao-${primeiro}`)?.focus();
            return null;
        }
        
        return {
            idLote: sanitizeText(values.idLote.trim()).toUpperCase(),
            consumoAtual: Number(values.consumoAtual),
            consumoAlvo: Number(values.consumoAlvo),
            precoAgua: Number(values.precoAgua),
            precoEnergia: Number(values.precoEnergia),
            quantidadeAves: Number(values.quantidadeAves),
            gastoAlvoEnergia: Number(values.gastoAlvoEnergia),
        };
    };
    
    return { values, errors, change, validar };
}