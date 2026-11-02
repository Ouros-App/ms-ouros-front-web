import { useEffect, useState } from 'react';
import { listarGranjas } from '@/services/farmService';
import type { GranjasEstado } from '@/types/granjas.types';
import { isAbortError } from '@/utils/delay';

const estadoInicial: GranjasEstado = { lista: [], status: 'carregando', mensagemErro: '' };

export function useGranjas() {
    const [estado, setEstado] = useState<GranjasEstado>(estadoInicial);

    useEffect(() => {
        const controller = new AbortController();
        listarGranjas(controller.signal)
            .then((lista) => setEstado({ lista, status: 'pronto', mensagemErro: '' }))
            .catch((error: unknown) => {
                if (controller.signal.aborted || isAbortError(error)) return;
                setEstado({
                    lista: [],
                    status: 'erro',
                    mensagemErro: error instanceof Error ? error.message : 'Não foi possível carregar as granjas.',
                });
            });
        return () => controller.abort();
    }, []);

    return { granjas: estado.lista, status: estado.status, mensagemErro: estado.mensagemErro };
}