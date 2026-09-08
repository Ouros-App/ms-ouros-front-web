import { Link } from 'react-router-dom';

const items = [
  { id: '1', name: 'Produto A', price: 99.9 },
  { id: '2', name: 'Produto B', price: 149.9 },
];

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold text-white">Produtos</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/products/${item.id}`}
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-100 shadow-soft"
          >
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="mt-2 text-slate-400">R$ {item.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
