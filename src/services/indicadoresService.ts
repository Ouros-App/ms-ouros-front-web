import type { IndicadoresSimulacao } from "@/types/simulacoes.types";
import { isAbortError } from "@/utils/delay";
import { ServiceError } from "./authService";
import { listarGranjas } from "./farmService";
import { obterRankingGranja } from "./rankingService";
import { listarSimulacoes } from "./simulacoesService";
import { springRequest } from "./springClient";

export interface FiltroIndicadores {
    idEnterprise?: number | null;
}

/**
 * Indicadores do topo da tela de simulação:
 * - posicao: /farms/{id}/ranking (rank_position)
 * - consumo / litrosPorAve: /farms/{id}/metrics/water-consumption (assumido em litros) e aves atuais da granja
 * - kwhPorAve: gasto alvo de energia / quantidade de aves da simulação mais recente (0 quando não há simulações)
 */
export async function obterIndicadoresSimulacao(signal?: AbortSignal, filtro?: FiltroIndicadores): Promise<IndicadoresSimulacao> {
    try {
        const granjas = await listarGranjas(signal);
        const doContexto = filtro?.idEnterprise ? granjas.filter((g) => g.idEnterprise === filtro.idEnterprise) : granjas;
        const granja = doContexto[0];
        if (!granja) throw new ServiceError('Nenhuma granja encontrada para calcular os indicadores.');

        const [ranking, agua, simulacoes] = await Promise.all([
            obterRankingGranja(granja.id, signal),
            springRequest<{ water_consumption: number | null }>(
                `/farms/${granja.id}/metrics/water-consumption`,
                { signal },
                'Não foi possível carregar o consumo de água.',
            ).catch(async (error: unknown) => {
                if (isAbortError(error)) throw error;
                const registros = await springRequest<Array<{ start_hydrometer: number; end_hydrometer: number }>>('/water-registries', { query: { farm_id: granja.id }, signal });
                return { water_consumption: registros.reduce((total, r) => total + Math.max(0, Number(r.end_hydrometer) - Number(r.start_hydrometer)), 0) };
            }),
            listarSimulacoes(signal, { idFarm: granja.id }),
        ]);

        const consumo = Number(agua?.water_consumption ?? 0);
        const aves = simulacoes[0]?.quantidadeAves ?? 0;
        return {
            consumo,
            litrosPorAve: aves > 0 ? consumo / aves : 0,
            kwhPorAve: aves > 0 ? (simulacoes[0]?.gastoAlvoEnergia ?? 0) / aves : 0,
            posicao: ranking.posicao ?? 0,
        };
    } catch (error) {
        if (isAbortError(error) && error instanceof Error) throw error;
        if (error instanceof ServiceError) throw error;
        throw new ServiceError('Não foi possível carregar os indicadores.');
    }
}
