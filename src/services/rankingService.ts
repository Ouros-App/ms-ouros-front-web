import { springRequest } from './springClient';

export interface RankingGranja {
    idFarm: number;
    posicao: number | null;
    score: number | null;
}

export interface PrevisaoRanking {
    posicaoAtual: number | null;
    posicaoSimulada: number | null;
    posicoesGanhas: number | null;
    ligaSimulada: string | null;
    totalGranjas: number | null;
}

interface RankingDto {
    farm_id: number;
    rank_position: number | null;
    score: number | null;
}

export interface SimulacaoRankingDto {
    current_position: number | null;
    simulated_position: number | null;
    positions_gained: number | null;
    simulated_league: string | null;
    total_farms: number | null;
}

export function paraPrevisao(dto: SimulacaoRankingDto | null | undefined): PrevisaoRanking | undefined {
    if (!dto) return undefined;
    return {
        posicaoAtual: dto.current_position,
        posicaoSimulada: dto.simulated_position,
        posicoesGanhas: dto.positions_gained,
        ligaSimulada: dto.simulated_league,
        totalGranjas: dto.total_farms,
    };
}

/** Posição atual da granja no ranking (GET /farms/{id}/ranking). */
export async function obterRankingGranja(idFarm: number, signal?: AbortSignal): Promise<RankingGranja> {
    const dto = await springRequest<RankingDto>(
        `/farms/${idFarm}/ranking`,
        { signal },
        'Não foi possível carregar o ranking da granja.',
    );
    return { idFarm, posicao: dto?.rank_position ?? null, score: dto?.score ?? null };
}

/** Previsão de posição para um score hipotético (GET /farms/{id}/ranking/simulate?score=). */
export async function simularRanking(idFarm: number, score: number, signal?: AbortSignal): Promise<PrevisaoRanking> {
    const dto = await springRequest<SimulacaoRankingDto>(
        `/farms/${idFarm}/ranking/simulate`,
        { query: { score }, signal },
        'Não foi possível calcular a previsão no ranking.',
    );
    return paraPrevisao(dto) as PrevisaoRanking;
}
