import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.4em] text-brand-200">404</p>
      <h1 className="text-4xl font-black text-white">Página não encontrada</h1>
      <Link to="/" className="text-brand-300">
        Voltar para a home
      </Link>
    </section>
  );
}
