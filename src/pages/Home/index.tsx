import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button/Button';

export default function HomePage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2">
      <div className="space-y-6">
        <span className="inline-flex rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-sm text-brand-100">
          React + TypeScript + Vite + Tailwind
        </span>
        <h1 className="text-4xl font-black text-white md:text-6xl">
          Base pronta para acelerar seu frontend web.
        </h1>
        <p className="max-w-xl text-lg text-slate-300">
          Estrutura modular com rotas, contexto, serviços, hooks e componentes reutilizáveis.
        </p>
        <Link to="/products">
          <Button>Explorar produtos</Button>
        </Link>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
        <h2 className="mb-4 text-2xl font-bold text-white">O que já vem no template</h2>
        <ul className="space-y-3 text-slate-300">
          <li>Rotas públicas e privadas</li>
          <li>Cliente de API centralizado</li>
          <li>Hook com AbortController</li>
          <li>Proteção básica contra XSS</li>
          <li>Build pronto para Docker + Nginx</li>
        </ul>
      </div>
    </section>
  );
}
