import { useEffect, useState } from "react";
import { contarNaoLidas } from "@/services/notificacaoService";
import { isAbortError } from "@/utils/delay";

export function useNotificacoes(){
    const [naoLidas, setNaoLidas] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        contarNaoLidas(controller.signal)
        .then(setNaoLidas)
        .catch((error: unknown) => {
            if(!isAbortError(error)) setNaoLidas(0);
        });
        return() => controller.abort();
    }, []);
    return {naoLidas};
}
