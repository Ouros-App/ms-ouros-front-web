import { ErrorPage } from '@/components/complex/ErrorPage';
import { conteudoNaoEncontrada } from '@/components/complex/ErrorPage/errorContent';

export default function NotFoundPage() {
  return (
    <ErrorPage
      titulo={conteudoNaoEncontrada.titulo}
      descricao={conteudoNaoEncontrada.descricao}
      rotaRetorno="/"
      rotuloRetorno="Voltar ao início"
    />
  );
}