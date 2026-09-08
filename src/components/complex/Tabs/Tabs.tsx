interface Item {
  id: string;
  label: string;
}

interface Props {
  items: Item[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ items, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          className={`rounded-full px-4 py-2 text-sm ${active === item.id ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-300'}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
