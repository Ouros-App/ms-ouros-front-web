import type { RankingErros, RankingValores } from '@/types/ranking.types';
import { isRequired } from './validators';

export const LIMITES_RANKING ={
    nomeMax: 40,
} as const;

export function validateRanking(values: RankingValores): RankingErros{
    const errors: RankingErros = {};
    const nome = values.nome.trim();
    
    if (!isRequired(nome)){
        errors.nome = 'Informe o nome do participante.';
    } 
    else if (nome.length > LIMITES_RANKING.nomeMax){
        errors.nome = `O nome pode ter no máximo ${LIMITES_RANKING.nomeMax} caracteres.`;
    }
    
    const pontuacao = Number(values.pontuacao);
    if (!isRequired(values.pontuacao) || Number.isNaN(pontuacao) || pontuacao < 0){
        errors.pontuacao = 'Informe a pontuação (0 ou mais).';
    }
    return errors;
}