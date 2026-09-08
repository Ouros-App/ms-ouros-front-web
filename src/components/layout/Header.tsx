import { APP_TITLE } from '@/utils/constants';

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <strong className="text-lg text-white">{APP_TITLE}</strong>
      </div>
    </header>
  );
}
