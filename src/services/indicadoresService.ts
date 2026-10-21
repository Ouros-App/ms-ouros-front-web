import type { IndicadoresSimulacao } from "@/types/simulacoes.types";
import { isAbortError, wait } from "@/utils/delay";
import { ServiceError } from "./authService";

export async function obterIndicadoresSimulacao(signal?: AbortSignal): Promise<IndicadoresSimulacao>{
    try{
        await wait(500, signal);
        return{consumo: 6.07, kwhPorAve: 5.2, litrosPorAve: 1022, posicao: 8.1};
    }
    catch(error){
        if(isAbortError(error) && error instanceof Error) throw error;
        if(error instanceof ServiceError) throw error;
        throw new ServiceError('Não foi possível carregar os indicadores.')
    }
}