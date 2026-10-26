import { useCallback, useState } from 'react';
import type { FiltrosDashboard } from '@/types/dashboard.types';
import { filtrosValidos } from '@/utils/dashboard';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';

const CHAVE_FILTROS = 'ouros:dashboard-filtros';
export function useFiltrosDashboard(){
    const [filtros, setFiltrosEstado] = useState<FiltrosDashboard>(() => filtrosValidos(lerArmazenado<FiltrosDashboard>(CHAVE_FILTROS)),
    );
    
    const setFiltros = useCallback((novos: FiltrosDashboard) =>{
        const validos = filtrosValidos(novos);
        setFiltrosEstado(validos);
        salvarArmazenado(CHAVE_FILTROS, validos);
    }, []);
    
    return { filtros, setFiltros };
}