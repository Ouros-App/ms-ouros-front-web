import { useEffect, useId, useRef } from 'react';
import type { DialogoSimulacaoProps } from '@/types/simulacoes.types';

export function Dialogo({ titulo, onFechar, children }: DialogoSimulacaoProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const tituloId = useId();
    const anteriorRef = useRef<HTMLElement | null>(null);
    
    useEffect(() => {
        const dialogo = ref.current;
        
        if (!anteriorRef.current) anteriorRef.current = document.activeElement as HTMLElement | null;
        
        if (dialogo && !dialogo.open) dialogo.showModal();
        return () => {
            const anterior = anteriorRef.current;
            const destino = anterior?.isConnected ? anterior : document.getElementById('simulacoes-busca');
            destino?.focus();
        };
    }, []);

    useEffect(() => {
        const dialogo = ref.current;
        const fecharAoClicarFora = (evento: MouseEvent) => {
            if (evento.target === dialogo) onFechar();
        };
        dialogo?.addEventListener('click', fecharAoClicarFora);
        return () => dialogo?.removeEventListener('click', fecharAoClicarFora);
    }, [onFechar]);
    
    return (
    <dialog ref={ref} className="simulacao-dialogo" aria-labelledby={tituloId} onClose={onFechar}>
        
        <div className="simulacao-dialogo__corpo">
            <div className="simulacao-dialogo__topo">
                <h2 id={tituloId} className="simulacao-dialogo__titulo">
                    {titulo}
                </h2>

                <button type="button" className="simulacao-dialogo__fechar" onClick={onFechar} aria-label="Fechar">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            {children}
        </div>
    </dialog>
    );
}