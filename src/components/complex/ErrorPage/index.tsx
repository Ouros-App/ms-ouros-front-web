import { Link } from 'react-router-dom';
import type { ErrorPageProps } from '@/types/error.types';
import { mascoteErro } from './errorAssets';
import './ErrorPage.css';

export function ErrorPage({
  titulo,
  descricao,
  onTentarNovamente,
  rotaRetorno,
  rotuloRetorno = 'Voltar ao início',
}: ErrorPageProps) {
  const temAcoes = Boolean(onTentarNovamente || rotaRetorno);

  return (
    <main className="error-page">
      <span className="error-page__blob error-page__blob--top" aria-hidden="true" />
      <span className="error-page__blob error-page__blob--bottom" aria-hidden="true" />

      <section className="error-page__content" role="alert" aria-labelledby="error-page-title">
        {mascoteErro && (
          <img
            className="error-page__mascot"
            src={mascoteErro}
            alt="Mascote Midas, um pintinho amarelo tonto com estrelas girando ao redor da cabeça"
          />
        )}
        <h1 id="error-page-title" className="error-page__title">
          {titulo}
        </h1>
        <p className="error-page__text">{descricao}</p>

        {temAcoes && (
          <div className="error-page__acoes">
            {onTentarNovamente && (
              <button type="button" className="error-page__botao" onClick={onTentarNovamente}>
                Tentar novamente
              </button>
            )}
            {rotaRetorno && (
              <Link to={rotaRetorno} className="error-page__botao error-page__botao--secundario">
                {rotuloRetorno}
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}