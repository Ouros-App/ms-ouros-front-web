import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/services/springClient', () => ({ springRequest: vi.fn() }));
vi.mock('@/services/apiClient', () => ({ fetchComAuth: vi.fn() }));
import { springRequest } from '@/services/springClient';
import { fetchComAuth } from '@/services/apiClient';
import { listarRegistrosPaginados } from '@/services/registroService';
import { listarSimulacoesPaginadas } from '@/services/simulacoesService';
import { listarMetasPaginadas, isMetaConcluida, atualizarMeta } from '@/services/metasService';
import { listarRankingPaginado } from '@/services/rankingService';
import { getCorporateFarmsPage } from '@/services/telemetryDashboardService';
beforeEach(() => vi.resetAllMocks());
const query = { page: 2, size: 25, search: 'Granja', sort: 'nome' };
const envelope = { page: 2, size: 25, totalElements: 53, totalPages: 3 };

it('registros e simulações preservam os filtros e mapeiam apenas o content', async () => {
 const request = vi.mocked(springRequest);
 request.mockResolvedValueOnce({ ...envelope, content: [{ id: 7, id_lote: 'L7', data_emissao: '2026-01-01', entraram: 12 }] });
 const records = await listarRegistrosPaginados(query, undefined, { idEnterprise: 3, idFarm: 9 });
 expect(request).toHaveBeenLastCalledWith('/lots/production-summaries/paged', expect.objectContaining({ query: { ...query, sort: 'id', direction: 'desc', id_enterprise: 3, id_farm: 9 } }));
 expect(records).toMatchObject({ ...envelope, content: [{ id: '7', idLote: 'L7', entraram: 12 }] });
 request.mockResolvedValueOnce({ ...envelope, content: [{ id: 2, id_lot: 'L2', current_cgi: 7 }] });
 expect(await listarSimulacoesPaginadas(query)).toMatchObject({ ...envelope, content: [{ id: '2', consumoAtual: 7 }] });
});

it('metas exigem contagens e resumo global reais', async () => {
 vi.mocked(springRequest).mockResolvedValueOnce({ ...envelope, statusCounts: { CONCLUIDA: 2, Pendente: 1 }, content: [{ id: 1, title: 'Água', region: 'SP', type: 'TASK_COMPLETION', status: 'Pendente', target_value: 999 }] });
 expect(await listarMetasPaginadas(query)).toMatchObject({ summary: { percentual: (2 / 3) * 100, concluidas: 2, total: 3 }, content: [{ totalGranjas: 999, concluidos: 0, type: 'TASK_COMPLETION', status: 'Pendente' }] });
 vi.mocked(springRequest).mockResolvedValueOnce({ ...envelope, statusCounts: undefined, content: [] });
 await expect(listarMetasPaginadas(query)).rejects.toThrow('Resumo global');
});

it('ranking mantém posição e liga globais mesmo após busca textual', async () => {
 vi.mocked(springRequest).mockResolvedValueOnce({ ...envelope, totalElements: 100, content: [{ farm_id: 7, farm_name: 'Granja', rank_position: 20, score: 8 }] });
 const result = await listarRankingPaginado(query, undefined, 3);
 expect(result.content[0]).toMatchObject({ id: '7', posicao: 20, liga: 'prata' });
 expect(result.totalElements).toBe(100);
 expect(springRequest).toHaveBeenLastCalledWith('/farms/rankings/paged', expect.objectContaining({ query: { ...query, sort: 'farm_name', direction: 'asc', id_enterprise: 3 } }));
});

it('telemetria farms converte índices e usa limit sem perder escopo', async () => {
 vi.mocked(fetchComAuth).mockResolvedValueOnce(new Response(JSON.stringify({ items: [], page: 3, limit: 25, total: 53 })));
 const result = await getCorporateFarmsPage(query, { enterpriseId: 3, state: 'SP', management: 'Norte', month: '2026-10' });
 const url = new URL(String(vi.mocked(fetchComAuth).mock.calls[0][0]), 'http://localhost');
 expect(url.searchParams.get('page')).toBe('3');
 expect(url.searchParams.get('limit')).toBe('25');
 expect(url.searchParams.get('page_size')).toBeNull();
 expect(url.searchParams.get('enterprise_id')).toBe('3');
 expect(url.searchParams.get('search')).toBe('Granja');
 expect(result).toEqual({ content: [], ...envelope });
});


it('isMetaConcluida reconhece status multilingue e atualizarMeta envia status', async () => {
 expect(isMetaConcluida('COMPLETED')).toBe(true);
 expect(isMetaConcluida('Concluída')).toBe(true);
 expect(isMetaConcluida('CONCLUIDA')).toBe(true);
 expect(isMetaConcluida('ACHIEVED')).toBe(true);
 expect(isMetaConcluida('PENDING')).toBe(false);
 expect(isMetaConcluida('Pendente')).toBe(false);
 expect(isMetaConcluida(null)).toBe(false);

 vi.mocked(springRequest).mockResolvedValueOnce({});
 await atualizarMeta('42', { meta: 'Reduzir perdas', concluidos: 1, totalGranjas: 1, type: 'TASK_COMPLETION', status: 'COMPLETED' });
 expect(springRequest).toHaveBeenCalledWith('/state-goals/42', {
  method: 'PATCH',
  body: { title: 'Reduzir perdas', status: 'COMPLETED' },
 });
});
