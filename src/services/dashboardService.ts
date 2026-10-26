import type { FiltrosDashboard, IndicadoresDashboard } from '@/types/dashboard.types';
import { isAbortError, wait } from '@/utils/delay';
import { ServiceError } from './authService';

export async function obterIndicadoresDashboard(
    filtros: FiltrosDashboard, signal?: AbortSignal, ): Promise<IndicadoresDashboard>{
        try{
            await wait(600, signal);
            void filtros;
            return{ gastoAnoPassado: 15_110_000, gastoAnoAtual: 13_090_000, custoPorAve: 25.94, totalLotes: 104728, };
        } 
        catch (error){
            if (isAbortError(error) && error instanceof Error) throw error;
            throw new ServiceError('Não foi possível carregar os indicadores do dashboard.');
        }
}