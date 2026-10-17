import { Link } from 'react-router-dom';
import type { ErrorPageProps } from '@/types/error.types';
import { mascoteErro } from './errorAssets';
import './ErrorPage.css';

export function ErrorPage({ titulo, descricao, onTentarNovamente }: ErrorPageProps) {
  return (
    <main className="error-page" role="alert">
        <span className="error-page__blob error-page__blob--top" aria-hidden="true" />
        <span className="error-page__blob error-page__blob--bottom" aria-hidden="true" />

        <section className="error-page__content" aria-labelledby="error-page-title">
            
            {mascoteErro && (
                <img className="error-page__mascot" src={mascoteErro} alt="Mascote Midas, um pintinho amarelo tonto com estrelas girando ao redor da cabeça"/>
            )}
            <h1 id="error-page-title" className="error-page__title">
                {titulo}
            </h1>
            <p className="error-page__text">{descricao}</p>

            <div className="error-page__actions">
          {onTentarNovamente && (
            <button type="button" className="error-page__button" onClick={onTentarNovamente}>
              Tentar novamente
            </button>
          )}
          <Link className="error-page__button error-page__button--ghost" to="/">
            Voltar ao início
          </Link>
        </div>
        </section>
    </main>
  );
}