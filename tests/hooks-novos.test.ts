import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
vi.mock('@/services/farmService', () => ({ listarGranjas: vi.fn() }));
vi.mock('@/services/rankingService', () => ({ simularRanking: vi.fn() }));
import { listarGranjas } from '@/services/farmService';
import { simularRanking } from '@/services/rankingService';
import { useGranjas } from '@/hooks/useGranjas';
import { useEnvio } from '@/hooks/useEnvio';
import { usePrevisaoSimulacao } from '@/hooks/usePrevisaoSimulacao';
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

it('useGranjas carrega a lista de granjas', async () => {
  const lista = [{ id: 1, nome: 'Granja', regiao: null, idEnterprise: 1 }];
  vi.mocked(listarGranjas).mockResolvedValue(lista);
  const { result } = renderHook(() => useGranjas());
  expect(result.current.status).toBe('carregando');
  await waitFor(() => expect(result.current.status).toBe('pronto'));
  expect(result.current.granjas).toEqual(lista);
  expect(result.current.mensagemErro).toBe('');
});

it('useGranjas expõe a mensagem de erro', async () => {
  vi.mocked(listarGranjas).mockRejectedValue(new Error('falhou'));
  const { result } = renderHook(() => useGranjas());
  await waitFor(() => expect(result.current.status).toBe('erro'));
  expect(result.current.mensagemErro).toBe('falhou');
  expect(result.current.granjas).toEqual([]);
});

it('useGranjas usa mensagem padrão quando o erro não é Error', async () => {
  vi.mocked(listarGranjas).mockRejectedValue('x');
  const { result } = renderHook(() => useGranjas());
  await waitFor(() => expect(result.current.status).toBe('erro'));
  expect(result.current.mensagemErro).toBe('Não foi possível carregar as granjas.');
});

it('useGranjas ignora abort ao desmontar', async () => {
  vi.mocked(listarGranjas).mockImplementation(() => new Promise(() => undefined));
  const { result, unmount } = renderHook(() => useGranjas());
  unmount();
  expect(result.current.status).toBe('carregando');
});

it('useEnvio controla enviando e falha em um único estado', () => {
  const { result } = renderHook(() => useEnvio());
  expect(result.current.enviando).toBe(false);
  act(() => result.current.avisar('aviso'));
  expect(result.current.falha).toBe('aviso');
  act(() => result.current.iniciar());
  expect(result.current.enviando).toBe(true);
  expect(result.current.falha).toBe('');
  act(() => result.current.falhar('erro'));
  expect(result.current.enviando).toBe(false);
  expect(result.current.falha).toBe('erro');
});

it('usePrevisaoSimulacao valida o consumo alvo', async () => {
  const { result } = renderHook(() => usePrevisaoSimulacao());
  await act(async () => { await result.current.calcular(1, 0); });
  expect(result.current.erroPrevisao).toContain('maior que zero');
  expect(simularRanking).not.toHaveBeenCalled();
});

it('usePrevisaoSimulacao exige uma granja', async () => {
  const { result } = renderHook(() => usePrevisaoSimulacao());
  await act(async () => { await result.current.calcular(0, 5); });
  expect(result.current.erroPrevisao).toBe('Nenhuma granja disponível para calcular a previsão.');
  expect(result.current.calculando).toBe(false);
});

it('usePrevisaoSimulacao devolve a previsão calculada', async () => {
  const previsao = { posicaoAtual: 3, posicaoSimulada: 1, posicoesGanhas: 2, ligaSimulada: 'Ouro' };
  vi.mocked(simularRanking).mockResolvedValue(previsao as never);
  const { result } = renderHook(() => usePrevisaoSimulacao());
  await act(async () => { await result.current.calcular(1, 5); });
  expect(simularRanking).toHaveBeenCalledWith(1, 5);
  expect(result.current.previsao).toEqual(previsao);
  expect(result.current.erroPrevisao).toBe('');
});

it('usePrevisaoSimulacao trata falha do serviço', async () => {
  vi.mocked(simularRanking).mockRejectedValue(new Error('indisponível'));
  const { result } = renderHook(() => usePrevisaoSimulacao());
  await act(async () => { await result.current.calcular(1, 5); });
  expect(result.current.erroPrevisao).toBe('indisponível');
  vi.mocked(simularRanking).mockRejectedValue('x');
  await act(async () => { await result.current.calcular(1, 5); });
  expect(result.current.erroPrevisao).toBe('Não foi possível calcular a previsão.');
});