import { springRequest } from './springClient';

export interface RankingGranja {
    idFarm: number;
    posicao: number | null;
    score: number | null;
}

export interface RankingItem {
    idFarm: number;
    farmName: string;
    region?: string | null;
    score: number;
    rankPosition: number;
    league?: string | null;
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
    farm_name?: string;
    region?: string;
    rank_position: number | null;
    score: number | null;
}

interface PodiumDto {
    current_farm_id?: number;
    ranking_podium?: Array<{
        farm_id: number;
        farm_name: string;
        region?: string;
        score: number;
        rank_position: number;
    }>;
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

/** Obter ranking geral de granjas (GET /farms/rankings). */
export async function obterRankingGeral(enterpriseId?: number, signal?: AbortSignal): Promise<RankingItem[]> {
    const query = enterpriseId ? { id_enterprise: enterpriseId, limit: 50 } : { limit: 50 };
    const lista = await springRequest<RankingDto[]>(
        '/farms/rankings',
        { query, signal },
        'Não foi possível carregar o ranking geral.',
    );
    return (lista ?? []).map((r, i) => ({
        idFarm: r.farm_id,
        farmName: r.farm_name || `Granja #${r.farm_id}`,
        region: r.region,
        score: Number(r.score ?? 0),
        rankPosition: Number(r.rank_position ?? i + 1),
        league: r.rank_position && r.rank_position <= 3 ? 'Liga Ouro' : 'Liga Prata',
    }));
}

/** Obter pódio relativo de uma granja (GET /farms/{id}/ranking/podium). */
export async function obterPodioRanking(idFarm: number, signal?: AbortSignal): Promise<RankingItem[]> {
    try {
        const res = await springRequest<PodiumDto>(
            `/farms/${idFarm}/ranking/podium`,
            { signal },
            'Não foi possível carregar o pódio.',
        );
        return (res?.ranking_podium ?? []).map((p) => ({
            idFarm: p.farm_id,
            farmName: p.farm_name,
            region: p.region,
            score: Number(p.score ?? 0),
            rankPosition: Number(p.rank_position ?? 1),
            league: 'Pódio',
        }));
    } catch {
        return [];
    }
}

/** Sincronizar o ranking de uma ou todas as empresas no Redis (POST /farms/rankings/sync). */
export async function sincronizarRanking(enterpriseId?: number, signal?: AbortSignal): Promise<void> {
    const query = enterpriseId ? { id_enterprise: enterpriseId } : undefined;
    await springRequest<void>(
        '/farms/rankings/sync',
        { method: 'POST', query, signal },
        'Não foi possível sincronizar os rankings.',
    );
}
