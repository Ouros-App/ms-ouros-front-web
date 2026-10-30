import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: '1' }, login: vi.fn(), updateUser: vi.fn() }) }));
vi.mock('@/services/registroService', () => ({ listarRegistrosPaginados: vi.fn(), criarRegistro: vi.fn(), atualizarRegistro: vi.fn(), excluirRegistro: vi.fn() }));
vi.mock('@/services/simulacoesService', () => ({ listarSimulacoesPaginadas: vi.fn(), criarSimulacao: vi.fn(), atualizarSimulacao: vi.fn(), excluirSimulacao: vi.fn() }));
vi.mock('@/services/rankingService', () => ({ listarRankingPaginado: vi.fn(), atualizarParticipante: vi.fn(), excluirParticipante: vi.fn() }));
vi.mock('@/services/telemetryDashboardService', () => ({ getCorporateKpis: vi.fn(), getCorporateChartData: vi.fn(), getCorporateFilters: vi.fn() }));
vi.mock('@/services/perfilService', () => ({ obterPerfil: vi.fn(), atualizarPerfil: vi.fn() }));
import * as registros from '@/services/registroService';
import * as simulacoes from '@/services/simulacoesService';
import * as ranking from '@/services/rankingService';
import * as telemetry from '@/services/telemetryDashboardService';
import * as perfil from '@/services/perfilService';
import { useRegistros } from '@/hooks/useRegistros';
import { useSimulacoes } from '@/hooks/useSimulacoes';
import { useRanking } from '@/hooks/useRanking';
import { usePerfil } from '@/hooks/usePerfil';
import { useIndicadoresDashboard } from '@/hooks/useIndicadoresDashboard';
import { useGraficoTelemetry, useGraficosTelemetryConjunto } from '@/hooks/useGraficosTelemetry';
import { useFiltrosDashboard } from '@/hooks/useFiltrosDashboard';
afterEach(cleanup);
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); });
const envelope = (content: unknown[], page = 0, totalElements = content.length) => ({ content, page, size: 10, totalElements, totalPages: Math.ceil(totalElements / 10) });
for (const spec of [
 { hook: useRegistros, list: registros.listarRegistrosPaginados, create: registros.criarRegistro, update: registros.atualizarRegistro, remove: registros.excluirRegistro, key: 'registros' },
 { hook: useSimulacoes, list: simulacoes.listarSimulacoesPaginadas, create: simulacoes.criarSimulacao, update: simulacoes.atualizarSimulacao, remove: simulacoes.excluirSimulacao, key: 'simulacoes' },
]) {
 it(`${spec.key}: busca e ordenação são enviadas ao servidor; mutações recarregam a página`, async () => {
  const item = { id: '1', idLote: 'L1', consumoAtual: 2, entraram: 3, sairam: 1 };
  vi.mocked(spec.list).mockResolvedValue(envelope([item]) as never);
  const { result } = renderHook(spec.hook);
  await waitFor(() => expect(result.current.status).toBe('pronto'));
  act(() => result.current.setBusca('L2'));
  await waitFor(() => expect(spec.list).toHaveBeenLastCalledWith({ page: 0, size: 10, search: 'L2', sort: 'padrao' }, expect.any(AbortSignal)));
  vi.mocked(spec.list).mockResolvedValue(envelope([{ ...item, idLote: 'L2' }]) as never);
  await act(async () => { await result.current.salvar(item as never, '1'); });
  await waitFor(() => expect(result.current[spec.key as 'registros'][0].idLote).toBe('L2'));
  vi.mocked(spec.list).mockResolvedValue(envelope([]) as never);
  await act(async () => { await result.current.excluir('1'); });
  await waitFor(() => expect(result.current[spec.key as 'registros']).toEqual([]));
 });
 it(`${spec.key}: recupera uma falha de carregamento`, async () => {
  vi.mocked(spec.list).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(envelope([]) as never);
  const { result } = renderHook(spec.hook);
  await waitFor(() => expect(result.current.status).toBe('erro'));
  act(() => result.current.recarregar());
  await waitFor(() => expect(result.current.status).toBe('pronto'));
 });
}
it('ranking preserva posição global retornada pelo servidor', async () => {
 vi.mocked(ranking.listarRankingPaginado).mockResolvedValue(envelope([{ id: '1', nome: 'Ana', pontuacao: 5, atualizadoEm: '', posicao: 32, liga: 'bronze' }]) as never);
 const { result } = renderHook(useRanking);
 await waitFor(() => expect(result.current.status).toBe('pronto'));
 expect(result.current.participantes[0].posicao).toBe(32);
 act(() => result.current.setOrdenacao('nome'));
 await waitFor(() => expect(ranking.listarRankingPaginado).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'nome', page: 0 }), expect.any(AbortSignal), undefined));
});
it('perfil sincroniza dados após salvar', async () => {
 vi.mocked(perfil.obterPerfil).mockResolvedValue({ id: '1', nome: 'Ana' } as never);
 vi.mocked(perfil.atualizarPerfil).mockResolvedValue({ id: '1', nome: 'Bia' } as never);
 const { result } = renderHook(usePerfil);
 await waitFor(() => expect(result.current.status).toBe('pronto'));
 await act(async () => { await result.current.salvar({ nome: 'Bia' } as never); });
 expect(result.current.perfil?.nome).toBe('Bia');
});
const filtros = { periodo: 'atual', estado: 'todos' };
for (const [name, hook, request] of [
 ['indicadores', () => useIndicadoresDashboard(filtros), telemetry.getCorporateKpis],
 ['gráfico', () => useGraficoTelemetry('monthly-cost', filtros), telemetry.getCorporateChartData],
 ['conjunto', () => useGraficosTelemetryConjunto(filtros), telemetry.getCorporateChartData],
] as const) {
 it(`${name}: mostra falha e recarrega dados`, async () => {
  vi.mocked(request).mockRejectedValue(new Error('offline'));
  const { result } = renderHook(hook);
  await waitFor(() => expect(result.current.status).toBe('erro'));
  vi.mocked(request).mockResolvedValue([] as never);
  act(() => result.current.recarregar());
  await waitFor(() => expect(result.current.status).toBe('pronto'));
 });
}
it('filtros corporativos carregam opções e persistem seleção', async () => {
 vi.mocked(telemetry.getCorporateFilters).mockResolvedValue({ states: ['SP'] } as never);
 const { result } = renderHook(useFiltrosDashboard);
 await waitFor(() => expect(result.current.carregandoOpcoes).toBe(false));
 act(() => result.current.setFiltros({ periodo: '2026-01', estado: 'SP' }));
 expect(result.current.filtros.estado).toBe('SP');
});
