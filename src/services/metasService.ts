import type { PageQuery, PageResponse } from '@/types/pagination.types';
import type { MetaCreation, MetaEdicao, MetaEstadual, ResumoMetas } from '@/types/metas.types';
import { springRequest } from './springClient';
import { ServiceError } from './authService';

export interface StateGoalAudience { state: string; id_enterprise: number; participants_count: number; }
export interface StateGoalCreated extends StateGoalAudience { id: number; }
export async function obterPublicoMeta(state: string, idEnterprise?: number | null, signal?: AbortSignal): Promise<StateGoalAudience> {
    return springRequest('/state-goals/audience', { query: { state, id_enterprise: idEnterprise }, signal });
}
export function dataLocal(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export async function lancarMetaEstadual(titulo: string, options?: MetaCreation): Promise<StateGoalCreated> {
    if (!options?.state || !options.dateEnd) throw new ServiceError('Informe a UF e o prazo.');
    return springRequest('/state-goals/by-state', { method: 'POST', body: {
        state: options.state, id_enterprise: options.idEnterprise ?? undefined,
        goal: { title: titulo,
            date_creation: dataLocal(new Date()), date_end: options.dateEnd },
    } });
}

export async function atualizarMeta(id: string, dados: MetaEdicao): Promise<void> {
    await springRequest(`/state-goals/${encodeURIComponent(id)}`, { method: 'PATCH', body: { title: dados.meta, ...(dados.type === 'TASK_COMPLETION' ? {} : { target_value: dados.totalGranjas }) } });
}

export async function excluirMeta(id: string): Promise<void> {
    await springRequest(`/state-goals/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** Aggregate supplied by the paged endpoint for all matching goals. */
export interface MetasPageResponse extends PageResponse<MetaEstadual> {
    statusCounts: Record<string, number>;
    summary: ResumoMetas;
}

export async function listarMetasPaginadas(query: PageQuery, signal?: AbortSignal): Promise<MetasPageResponse> {
    const data = await springRequest<PageResponse<{
        id: number; region?: string; title: string; description?: string; type?: string;
        status: string; target_value?: number; date_creation?: string; date_end?: string;
    }> & { statusCounts: Record<string, number> }>('/state-goals/paged', {
        query: { ...query, sort: mapearSortMeta(query.sort) }, signal,
    });
    if (!data.statusCounts || Object.values(data.statusCounts).some((count) => !Number.isFinite(count))) {
        throw new ServiceError('Resumo global de metas indisponível.');
    }
    const concluidas = Object.entries(data.statusCounts)
        .filter(([status]) => ['CONCLUIDA', 'COMPLETED', 'COMPLETED_SUCCESSFULLY'].includes(status.toUpperCase()))
        .reduce((total, [, count]) => total + count, 0);
    const total = Object.values(data.statusCounts).reduce((sum, count) => sum + count, 0);
    const summary = { total, concluidas, percentual: total > 0 ? (concluidas / total) * 100 : 0 };
    return { ...data, summary, content: data.content.map((m) => ({
        id: String(m.id), estado: m.region ?? '', meta: m.title,
        totalGranjas: m.target_value ?? 0,
        concluidos: ['CONCLUIDA', 'COMPLETED', 'COMPLETED_SUCCESSFULLY'].includes(m.status.toUpperCase()) ? (m.target_value ?? 0) : 0,
    })) };
}

export async function obterResumoMetas(signal?: AbortSignal): Promise<ResumoMetas> {
    return (await listarMetasPaginadas({ page: 0, size: 1 }, signal)).summary;
}

function mapearSortMeta(sort?: string): string {
    const campos: Record<string, string> = {
        id: 'id', title: 'title', type: 'type', status: 'status', target_value: 'target_value',
        date_creation: 'date_creation', date_end: 'date_end', region: 'region',
    };
    return campos[sort ?? ''] ?? 'id';
}
