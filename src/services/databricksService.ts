import type { DadosGraficos, FiltrosDashboard, GraficoId } from '@/types/dashboard.types';
import { caminhosDatabricks } from '@/utils/databricks';
import { isAbortError } from '@/utils/delay';
import { apiClient } from './apiClient';
import { ServiceError } from './authService';

export async function obterGraficoDatabricks<K extends GraficoId>(
    id: K,
    filtros: FiltrosDashboard,
    signal?: AbortSignal, ): Promise<DadosGraficos[K]>{
        try{
            const parametros = new URLSearchParams({ periodo: filtros.periodo, estado: filtros.estado });
            const resposta = await apiClient<DadosGraficos[K]>(`${caminhosDatabricks[id]}?${parametros.toString()}`, { signal });
            return resposta.data;
        } 
        catch (error){
            if (isAbortError(error) && error instanceof Error) throw error;
            throw new ServiceError('Não foi possível carregar os dados do Databricks.');
        }
    }