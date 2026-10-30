import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/services/springClient', () => ({ springRequest: vi.fn() }));
vi.mock('@/services/apiClient', () => ({ fetchComAuth: vi.fn() }));
import { springRequest } from '@/services/springClient';
import { fetchComAuth } from '@/services/apiClient';
import { listarRegistrosPaginados } from '@/services/registroService';
import { listarSimulacoesPaginadas } from '@/services/simulacoesService';
import { listarMetasPaginadas } from '@/services/metas.Service';
import { listarRankingPaginado } from '@/services/rankingService';
import { getCorporateFarmsPage } from '@/services/telemetryDashboardService';
import { getAdminAiSessionsPage } from '@/services/adminAiMetricsService';
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
 vi.mocked(springRequest).mockResolvedValueOnce({ ...envelope, statusCounts: { CONCLUIDA: 2, Pendente: 1 }, content: [{ id: 1, title: 'Água', region: 'SP', status: 'Pendente', target_value: 999 }] });
 expect(await listarMetasPaginadas(query)).toMatchObject({ summary: { percentual: (2 / 3) * 100, concluidas: 2, total: 3 }, content: [{ totalGranjas: 999, concluidos: 0 }] });
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

for (const type of ['farms', 'sessions'] as const) {
 it(`telemetria ${type}: converte índices e usa limit sem perder escopo`, async () => {
  vi.mocked(fetchComAuth).mockResolvedValueOnce(new Response(JSON.stringify({ items: [], page: 3, limit: 25, total: 53 })));
  const result = type === 'farms'
    ? await getCorporateFarmsPage(query, { enterpriseId: 3, state: 'SP', management: 'Norte', month: '2026-10' })
    : await getAdminAiSessionsPage(query, 3);
  const url = new URL(String(vi.mocked(fetchComAuth).mock.calls[0][0]), 'http://localhost');
  expect(url.searchParams.get('page')).toBe('3');
  expect(url.searchParams.get('limit')).toBe('25');
  expect(url.searchParams.get('page_size')).toBeNull();
  expect(url.searchParams.get('enterprise_id')).toBe('3');
  expect(url.searchParams.get('search')).toBe('Granja');
  expect(result).toEqual({ content: [], ...envelope });
 });
}
