import type { PageQuery, PageResponse } from '@/types/pagination.types';
import type { ParticipanteRanking } from '@/types/ranking.types';
import { ligaDaPosicao } from '@/utils/ranking';
import type { Participante, ParticipanteEdicao } from '@/types/ranking.types';
import { isAbortError, wait } from '@/utils/delay';
import { ServiceError } from './authService';
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

let bancoParticipantes: Participante[] = [
    { id: 'p-1', nome: 'Marcelona', pontuacao: 8.65, atualizadoEm: '2026-08-25T14:32:00' },
    { id: 'p-2', nome: 'Rafael Souza', pontuacao: 8.41, atualizadoEm: '2026-08-25T14:32:00' },
    { id: 'p-3', nome: 'Camila Duarte', pontuacao: 8.1, atualizadoEm: '2026-08-24T09:15:00' },
    { id: 'p-4', nome: 'João Pedro', pontuacao: 7.88, atualizadoEm: '2026-08-24T09:15:00' },
    { id: 'p-5', nome: 'Larissa Gomes', pontuacao: 7.52, atualizadoEm: '2026-08-23T17:40:00' },
    { id: 'p-6', nome: 'Bruno Alves', pontuacao: 7.1, atualizadoEm: '2026-08-23T17:40:00' },
    { id: 'p-7', nome: 'Fernanda Lima', pontuacao: 6.74, atualizadoEm: '2026-08-22T11:05:00' },
    { id: 'p-8', nome: 'Diego Martins', pontuacao: 6.3, atualizadoEm: '2026-08-22T11:05:00' },
    { id: 'p-9', nome: 'Patrícia Rocha', pontuacao: 5.96, atualizadoEm: '2026-08-21T16:20:00' },
    { id: 'p-10', nome: 'Thiago Barros', pontuacao: 5.4, atualizadoEm: '2026-08-21T16:20:00' },
];

function agoraLocal(): string {
    const agora = new Date();
    const dois = (n: number) => String(n).padStart(2, '0');
    return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}T${dois(agora.getHours())}:${dois(agora.getMinutes())}:00`;
}

function falhar(error: unknown, mensagem: string): Error {
    if (isAbortError(error) && error instanceof Error) return error;
    if (error instanceof ServiceError) return error;
    return new ServiceError(mensagem);
}

export async function listarParticipantes(signal?: AbortSignal, enterpriseId?: number): Promise<Participante[]> {
    try {
        try {
            const granjas = await obterRankingGeral(enterpriseId, signal);
            if (granjas && granjas.length > 0) {
                return granjas.map((g) => ({
                    id: String(g.idFarm),
                    nome: g.farmName,
                    pontuacao: g.score,
                    atualizadoEm: agoraLocal(),
                }));
            }
        } catch {
            // Fallback para participantes mockados se API de granjas estiver offline
        }

        await wait(200, signal);
        return bancoParticipantes.map((p) => ({ ...p }));
    } catch (error) {
        throw falhar(error, 'Não foi possível carregar o ranking.');
    }
}

export async function atualizarParticipante(id: string, dados: ParticipanteEdicao): Promise<Participante> {
    try {
        await wait(300);
        if (!bancoParticipantes.some((p) => p.id === id)) {
            const novo: Participante = { id, ...dados, atualizadoEm: agoraLocal() };
            bancoParticipantes = [novo, ...bancoParticipantes.filter((p) => p.id !== id)];
            return { ...novo };
        }
        const atualizado: Participante = { id, ...dados, atualizadoEm: agoraLocal() };
        bancoParticipantes = bancoParticipantes.map((p) => (p.id === id ? atualizado : p));
        return { ...atualizado };
    } catch (error) {
        throw falhar(error, 'Não foi possível atualizar o participante.');
    }
}

export async function excluirParticipante(id: string): Promise<void> {
    try {
        await wait(200);
        bancoParticipantes = bancoParticipantes.filter((p) => p.id !== id);
    } catch (error) {
        throw falhar(error, 'Não foi possível excluir o participante.');
    }
}

export async function listarRankingPaginado(query: PageQuery, signal?: AbortSignal, enterpriseId?: number): Promise<PageResponse<ParticipanteRanking>> {
    const data = await springRequest<PageResponse<RankingDto>>('/farms/rankings/paged', {
        query: { ...query, sort: query.sort === 'nome' || query.sort === 'farm_name' ? 'farm_name' : 'score', direction: query.direction ?? 'asc', id_enterprise: enterpriseId }, signal,
    });
    return { ...data, content: data.content.map((g) => {
        if (g.rank_position == null) throw new ServiceError('Posição global do ranking indisponível.');
        return {
            id: String(g.farm_id), nome: g.farm_name ?? `Granja #${g.farm_id}`,
            pontuacao: g.score ?? 0, atualizadoEm: '', posicao: g.rank_position,
            liga: ligaDaPosicao(g.rank_position - 1, data.totalElements),
        };
    }) };
}
