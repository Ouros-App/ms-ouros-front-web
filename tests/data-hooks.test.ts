import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: '1' }, login: vi.fn(), updateUser: vi.fn() }) }));
vi.mock('@/services/registroService', () => ({ listarRegistro: vi.fn(), criarRegistro: vi.fn(), atualizarRegistro: vi.fn(), excluirRegistro: vi.fn() }));
vi.mock('@/services/simulacoesService', () => ({ listarSimulacoes: vi.fn(), criarSimulacao: vi.fn(), atualizarSimulacao: vi.fn(), excluirSimulacao: vi.fn() }));
vi.mock('@/services/rankingService', () => ({ listarParticipantes: vi.fn(), atualizarParticipante: vi.fn(), excluirParticipante: vi.fn() }));
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
for (const spec of [
 { hook: useRegistros, list: registros.listarRegistro, create: registros.criarRegistro, update: registros.atualizarRegistro, remove: registros.excluirRegistro, key: 'registros' },
 { hook: useSimulacoes, list: simulacoes.listarSimulacoes, create: simulacoes.criarSimulacao, update: simulacoes.atualizarSimulacao, remove: simulacoes.excluirSimulacao, key: 'simulacoes' },
]) {
 it(`${spec.key}: carrega, pesquisa, ordena, cria, atualiza e exclui`, async () => {
  const item = { id: '1', idLote: 'L1', consumoAtual: 2, entraram: 3, sairam: 1 };
  vi.mocked(spec.list).mockResolvedValue([item] as never);
  vi.mocked(spec.create).mockResolvedValue({ ...item, id: '2' } as never);
  vi.mocked(spec.update).mockResolvedValue({ ...item, idLote: 'L2' } as never);
  vi.mocked(spec.remove).mockResolvedValue(undefined);
  const { result } = renderHook(spec.hook);
  await waitFor(() => expect(result.current.status).toBe('pronto'));
  await act(async () => { await result.current.salvar(item as never); });
  expect(result.current[spec.key as 'registros']).toHaveLength(2);
  await act(async () => { await result.current.salvar(item as never, '1'); });
  act(() => { result.current.setBusca('L2'); result.current.setOrdenacao('padrao'); });
  expect(result.current[spec.key as 'registros']).toHaveLength(1);
  await act(async () => { await result.current.excluir('1'); });
  expect(result.current[spec.key as 'registros']).toHaveLength(0);
 });
 it(`${spec.key}: recupera uma falha de carregamento`, async () => {
  vi.mocked(spec.list).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
  const { result } = renderHook(spec.hook);
  await waitFor(() => expect(result.current.status).toBe('erro'));
  act(() => result.current.recarregar());
  await waitFor(() => expect(result.current.status).toBe('pronto'));
 });
}
it('ranking persiste ordenação e reflete edição e exclusão', async () => {
 vi.mocked(ranking.listarParticipantes).mockResolvedValue([{ id: '1', nome: 'Ana', pontuacao: 5, atualizadoEm: '2026-01-01' }]);
 vi.mocked(ranking.atualizarParticipante).mockResolvedValue({ id: '1', nome: 'Bia', pontuacao: 8, atualizadoEm: '2026-01-02' });
 const { result } = renderHook(useRanking);
 await waitFor(() => expect(result.current.status).toBe('pronto'));
 await act(async () => { await result.current.salvar('1', { nome: 'Bia', pontuacao: 8 }); });
 act(() => { result.current.setBusca('Bia'); result.current.setOrdenacao('nome'); });
 expect(result.current.participantes[0].nome).toBe('Bia');
 await act(async () => { await result.current.excluir('1'); });
 expect(result.current.participantes).toEqual([]);
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
