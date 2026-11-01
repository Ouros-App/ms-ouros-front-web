import type { PageQuery, PageResponse } from '@/types/pagination.types';
import type { MetaEdicao, MetaEstadual, ResumoMetas } from '@/types/metas.types';
import { springRequest } from './springClient';
import { ServiceError } from './authService';

export async function lancarMetaEstadual(titulo: string): Promise<void> {
    const hoje = new Date();
    const fim = new Date(hoje.getTime() + 90 * 86400000);
    await springRequest('/state-goals', { method: 'POST', body: {
        title: titulo, type: 'WATER_CONSUMPTION', status: 'IN_PROGRESS', target_value: 100,
        date_creation: hoje.toISOString().slice(0, 10), date_end: fim.toISOString().slice(0, 10), region: 'Sudeste',
    } });
}

export async function atualizarMeta(id: string, dados: MetaEdicao): Promise<void> {
    await springRequest(`/state-goals/${encodeURIComponent(id)}`, { method: 'PATCH', body: { title: dados.meta, target_value: dados.totalGranjas } });
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

function mapearSortMeta(sort?: string): string {
    const campos: Record<string, string> = {
        id: 'id', title: 'title', type: 'type', status: 'status', target_value: 'target_value',
        date_creation: 'date_creation', date_end: 'date_end', region: 'region',
    };
    return campos[sort ?? ''] ?? 'id';
}
