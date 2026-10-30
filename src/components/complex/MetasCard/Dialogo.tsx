import { useEffect, useId, useRef } from 'react';
import type { DialogoMetaProps } from '@/types/metas.types';

export function Dialogo({ titulo, onFechar, children }: DialogoMetaProps){
    const ref = useRef<HTMLDialogElement>(null);
    const tituloId = useId();
    const anteriorRef = useRef<HTMLElement | null>(null);
    
    useEffect(() =>{
        const dialogo = ref.current;
        if (!anteriorRef.current) anteriorRef.current = document.activeElement as HTMLElement | null;
        if (dialogo && !dialogo.open) dialogo.showModal();
        
        return () =>{
            const anterior = anteriorRef.current;
            const destino = anterior?.isConnected ? anterior : document.getElementById('metas-busca');
            destino?.focus();
        };
    }, []);

    return(
        <dialog
            ref={ref}
            className="metas-dialogo"
            aria-labelledby={tituloId}
            onClose={onFechar}
            onClick={(evento) =>{
            if (evento.target === ref.current) onFechar();
            }}
            >
            <div className="metas-dialogo__corpo">
                <div className="metas-dialogo__topo">
                    <h2 id={tituloId} className="metas-dialogo__titulo">
                        {titulo}
                    </h2>
                    <button type="button" className="metas-dialogo__fechar" onClick={onFechar} aria-label="Fechar">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    );
}