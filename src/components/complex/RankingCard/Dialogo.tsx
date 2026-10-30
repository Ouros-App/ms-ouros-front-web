import { useEffect, useId, useRef } from 'react';
import type { DialogoRankingProps } from '@/types/ranking.types';

export function Dialogo({ titulo, onFechar, children }: DialogoRankingProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const anteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!anteriorRef.current) anteriorRef.current = document.activeElement as HTMLElement | null;
    if (dialogo && !dialogo.open) dialogo.showModal();
    return () => {
      const anterior = anteriorRef.current;
      const destino = anterior?.isConnected ? anterior : document.getElementById('ranking-busca');
      destino?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="ranking-dialogo"
      aria-labelledby={tituloId}
      onClose={onFechar}
      onClick={(evento) => {
        if (evento.target === ref.current) onFechar();
      }}
    >
      <div className="ranking-dialogo__corpo">
        <div className="ranking-dialogo__topo">
          <h2 id={tituloId} className="ranking-dialogo__titulo">
            {titulo}
          </h2>
          <button type="button" className="ranking-dialogo__fechar" onClick={onFechar} aria-label="Fechar">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}