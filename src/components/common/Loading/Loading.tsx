type Props = {
  fullScreen?: boolean;
  label?: string;
};

export function Loading({ fullScreen = false, label = 'Carregando...' }: Props) {
  return (
    <div
      className={`${fullScreen ? 'min-h-screen' : 'min-h-[160px]'} flex items-center justify-center gap-3 text-slate-200`}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
