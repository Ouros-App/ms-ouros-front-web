import type { SimulacaoErros, SimulacaoValores } from '@/types/simulacoes.types';
import { isRequired } from './validators';

export const LIMITES_SIMULACAO = {
    idLoteMax: 20,
}as const;

function numeroNaoNegativo(valor: string): boolean{
    const numero = Number(valor);
    return isRequired(valor) && !Number.isNaN(numero) && numero >= 0;
}

export function validateSimulacao(values: SimulacaoValores): SimulacaoErros {
    const errors: SimulacaoErros = {};
    const idLote = values.idLote.trim();
    
    if (!isRequired(idLote)){
        errors.idLote = 'Informe o id do lote.';
    } 
    else if (idLote.length > LIMITES_SIMULACAO.idLoteMax){
        errors.idLote = `O id pode ter no máximo ${LIMITES_SIMULACAO.idLoteMax} caracteres.`;
    } 
    else if (!/^[A-Za-z0-9-]+$/.test(idLote)) {
        errors.idLote = 'Use apenas letras, números e hífen.';
    }

    if (!numeroNaoNegativo(values.consumoAtual)) {
        errors.consumoAtual = 'Informe o consumo atual (0 ou mais).';
    }

    if (!numeroNaoNegativo(values.consumoAlvo)) {
        errors.consumoAlvo = 'Informe o consumo alvo (0 ou mais).';
    }

    if (!numeroNaoNegativo(values.precoAgua)) {
        errors.precoAgua = 'Informe o preço por m³ da água (0 ou mais).';
    }

    if (!numeroNaoNegativo(values.precoEnergia)) {
        errors.precoEnergia = 'Informe o preço da energia (0 ou mais).';
    }

    const aves = Number(values.quantidadeAves);
    if (!isRequired(values.quantidadeAves) || !Number.isInteger(aves) || aves < 1) {
        errors.quantidadeAves = 'Informe um número inteiro de aves (1 ou mais).';
    }

    if (!numeroNaoNegativo(values.gastoAlvoEnergia)) {
        errors.gastoAlvoEnergia = 'Informe o gasto alvo de energia por ave (0 ou mais).';
    }

    return errors;
}