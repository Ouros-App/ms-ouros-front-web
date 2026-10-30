import { useState } from 'react';
import type { FormEvent } from 'react';
import type { RankingModalProps } from '@/types/ranking.types';
import { isAbortError } from '@/utils/delay';
import { Dialogo } from './Dialogo';
import { useRankingForm } from './useRankingForm';

export function RankingModal({ participante, onFechar, onSalvar }: RankingModalProps) {
  const { values, errors, change, validar } = useRankingForm(participante);
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState('');

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = validar();
    if (!dados) return;

    setEnviando(true);
    setFalha('');

    try {
      await onSalvar(participante.id, dados);
      onFechar();
    } catch (error) {
      if (isAbortError(error)) return;
      setFalha(error instanceof Error ? error.message : 'Não foi possível salvar o participante.');
      setEnviando(false);
    }
  };

  return (
    <Dialogo titulo="Editar participante" onFechar={onFechar}>
      <form className="ranking-form" onSubmit={enviar} noValidate>
        <div className="ranking-form__grade">
          <div className="ranking-form__campo">
            <label htmlFor="ranking-nome" className="ranking-form__rotulo">
              Participante
            </label>
            <input
              id="ranking-nome"
              name="nome"
              type="text"
              className={`ranking-form__input${errors.nome ? ' ranking-form__input--erro' : ''}`}
              value={values.nome}
              onChange={(evento) => change('nome', evento.target.value)}
              aria-invalid={errors.nome ? true : undefined}
              aria-describedby={errors.nome ? 'ranking-nome-erro' : undefined}
              disabled={enviando}
            />
            {errors.nome && (
              <p id="ranking-nome-erro" className="ranking-form__erro" role="alert">
                {errors.nome}
              </p>
            )}
          </div>

          <div className="ranking-form__campo">
            <label htmlFor="ranking-pontuacao" className="ranking-form__rotulo">
              Pontuação
            </label>
            <input
              id="ranking-pontuacao"
              name="pontuacao"
              type="number"
              step="0.01"
              min={0}
              className={`ranking-form__input${errors.pontuacao ? ' ranking-form__input--erro' : ''}`}
              value={values.pontuacao}
              onChange={(evento) => change('pontuacao', evento.target.value)}
              aria-invalid={errors.pontuacao ? true : undefined}
              aria-describedby={errors.pontuacao ? 'ranking-pontuacao-erro' : undefined}
              disabled={enviando}
            />
            {errors.pontuacao && (
              <p id="ranking-pontuacao-erro" className="ranking-form__erro" role="alert">
                {errors.pontuacao}
              </p>
            )}
          </div>
        </div>

        {falha && (
          <p className="ranking-form__falha" role="alert">
            {falha}
          </p>
        )}

        <div className="ranking-form__acoes">
          <button type="button" className="ranking-botao ranking-botao--secundario" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="ranking-botao" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}