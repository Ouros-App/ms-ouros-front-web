import { useState } from 'react';
import type { ParticipanteEdicao, ParticipanteRanking, RankingErros, RankingValores } from '@/types/ranking.types';
import { sanitizeText } from '@/utils/sanitizers';
import { validateRanking } from '@/utils/rankingValidators';

export function useRankingForm(participante: ParticipanteRanking) {
  const [values, setValues] = useState<RankingValores>({
    nome: participante.nome,
    pontuacao: String(participante.pontuacao),
  });
  const [errors, setErrors] = useState<RankingErros>({});

  const change = (campo: keyof RankingValores, valor: string) => {
    setValues((atual) => ({ ...atual, [campo]: valor }));
    setErrors((atual) => ({ ...atual, [campo]: undefined }));
  };

  const validar = (): ParticipanteEdicao | null => {
    const encontrados = validateRanking(values);
    setErrors(encontrados);

    const primeiro = (Object.keys(encontrados) as (keyof RankingValores)[])[0];
    if (primeiro) {
      document.getElementById(`ranking-${primeiro}`)?.focus();
      return null;
    }

    return {
      nome: sanitizeText(values.nome.trim()),
      pontuacao: Number(values.pontuacao),
    };
  };

  return { values, errors, change, validar };
}