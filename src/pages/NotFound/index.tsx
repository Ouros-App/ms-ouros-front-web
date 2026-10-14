import { ErrorPage } from '@/components/complex/ErrorPage';
import { conteudoNaoEncontrada } from '@/components/complex/ErrorPage/errorContent';

export default function NotFoundPage() {
  return <ErrorPage 
  titulo={conteudoNaoEncontrada.titulo} 
  descricao={conteudoNaoEncontrada.descricao} onTentarNovamente={function (): void {
    throw new Error('Function not implemented.');
  } } />;
}