import { useCallback, useState } from 'react';
import type { EnvioEstado } from '@/types/envio.types';

export function useEnvio() {
    const [estado, setEstado] = useState<EnvioEstado>({ enviando: false, falha: '' });
    const iniciar = useCallback(() => setEstado({ enviando: true, falha: '' }), []);
    const falhar = useCallback((falha: string) => setEstado({ enviando: false, falha }), []);
    const avisar = useCallback((falha: string) => setEstado((atual) => ({ ...atual, falha })), []);
    return { enviando: estado.enviando, falha: estado.falha, iniciar, falhar, avisar };
}