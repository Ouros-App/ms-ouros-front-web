import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { id } = useParams();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Produto</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Detalhe do produto {id}</h1>
        <p className="mt-4 text-slate-300">
          Página pronta para buscar item por id e compor a visualização detalhada.
        </p>
      </div>
    </section>
  );
}
