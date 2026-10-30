import { useEffect, useId, useRef } from "react";
import type { DialogoProps } from "@/types/registros.types";

    export function Dialogo({titulo, onFechar, children}: DialogoProps){
        const ref = useRef<HTMLDialogElement>(null);
        const tituloId = useId();
        const anteriorRef = useRef<HTMLElement | null>(null);

        useEffect(() => {
            const dialogo = ref.current;
            if (!anteriorRef.current) anteriorRef.current = document.activeElement as HTMLElement | null;
            if (dialogo && !dialogo.open) dialogo.showModal();
            return () => {
                const anterior = anteriorRef.current;
                const destino = anterior?.isConnected ? anterior : document.getElementById('registros-busca');
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

    return(
            <dialog ref={ref} className="dialogo" aria-labelledby={tituloId} onClose={onFechar}>
                <div className="dialogo__corpo">
                    <div className="dialogo__topo">
                        <h2 id={tituloId} className="dialogo__titulo">
                            {titulo}
                        </h2>
                        <button type="button" className="dialogo__fechar" onClick={onFechar} aria-label="Fechar">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    {children}
                </div>
            </dialog>
        );
    }