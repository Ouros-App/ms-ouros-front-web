import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Produtos' },
  { to: '/login', label: 'Login' },
];

export function Menu() {
  return (
    <div className="flex gap-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm ${isActive ? 'bg-brand-500 text-white' : 'text-slate-300'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
