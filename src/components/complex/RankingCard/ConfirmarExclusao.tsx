import { useState } from 'react';
import type { ConfirmarExclusaoRankingProps } from '@/types/ranking.types';
import { isAbortError } from '@/utils/delay';
import { Dialogo } from './Dialogo';

export function ConfirmarExclusao({ participante, onFechar, onExcluir }: ConfirmarExclusaoRankingProps) {
  const [excluindo, setExcluindo] = useState(false);
  const [falha, setFalha] = useState('');

  const confirmar = async () => {
    setExcluindo(true);
    setFalha('');

    try {
      await onExcluir(participante.id);
      onFechar();
    } catch (error) {
      if (isAbortError(error)) return;
      setFalha(error instanceof Error ? error.message : 'Não foi possível excluir o participante.');
      setExcluindo(false);
    }
  };

  return (
    <Dialogo titulo="Excluir participante" onFechar={onFechar}>
      <p className="ranking-form__texto">
        Tem certeza que deseja excluir <strong>{participante.nome}</strong> do ranking? Essa ação não pode ser desfeita.
      </p>

      {falha && (
        <p className="ranking-form__falha" role="alert">
          {falha}
        </p>
      )}

      <div className="ranking-form__acoes">
        <button type="button" className="ranking-botao ranking-botao--secundario" onClick={onFechar} disabled={excluindo}>
          Cancelar
        </button>
        <button type="button" className="ranking-botao ranking-botao--perigo" onClick={confirmar} disabled={excluindo}>
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </Dialogo>
  );
}