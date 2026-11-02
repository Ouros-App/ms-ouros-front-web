import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
vi.mock('@/services/metasService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/metasService')>()),
  obterEstadosComGranjas: vi.fn(),
  obterPublicoMeta: vi.fn(),
}));
import { obterEstadosComGranjas, obterPublicoMeta } from '@/services/metasService';
import { useNovaMeta } from '@/hooks/useNovaMeta';
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(obterEstadosComGranjas).mockResolvedValue(['SP']);
  vi.mocked(obterPublicoMeta).mockResolvedValue({ state: 'SP', id_enterprise: 1, participants_count: 3 });
});

const evento = () => ({ preventDefault: vi.fn() }) as never;

async function prepararHook(onLancar = vi.fn().mockResolvedValue(3)) {
  const hook = renderHook(() => useNovaMeta(onLancar));
  await waitFor(() => expect(hook.result.current.pronto).toBe(true));
  return { ...hook, onLancar };
}

it('seleciona a única UF disponível e consulta o público', async () => {
  const { result } = await prepararHook();
  expect(result.current.formulario.state).toBe('SP');
  expect(result.current.consulta.estadosDisponiveis).toHaveLength(1);
  expect(result.current.quantidade).toBe(3);
});

it('lança a meta e mostra mensagem de sucesso', async () => {
  const { result, onLancar } = await prepararHook();
  act(() => result.current.alterarTitulo('Manutenção preventiva'));
  await act(async () => { await result.current.enviar(evento()); });
  expect(onLancar).toHaveBeenCalledWith('Manutenção preventiva', expect.objectContaining({ state: 'SP' }));
  expect(result.current.envio.message).toContain('Meta criada para 3');
  expect(result.current.formulario.title).toBe('');
});

it('valida título vazio antes de enviar', async () => {
  const { result, onLancar } = await prepararHook();
  await act(async () => { await result.current.enviar(evento()); });
  expect(result.current.envio.error).not.toBe('');
  expect(onLancar).not.toHaveBeenCalled();
});

it('exige prazo a partir de hoje', async () => {
  const { result, onLancar } = await prepararHook();
  act(() => result.current.alterarTitulo('Manutenção preventiva'));
  act(() => result.current.alterarPrazo('2000-01-01'));
  await act(async () => { await result.current.enviar(evento()); });
  expect(result.current.envio.error).toBe('Informe a UF e um prazo a partir de hoje.');
  expect(onLancar).not.toHaveBeenCalled();
});

it('mostra a falha ao lançar a meta', async () => {
  const { result } = await prepararHook(vi.fn().mockRejectedValue(new Error('recusado')));
  act(() => result.current.alterarTitulo('Manutenção preventiva'));
  await act(async () => { await result.current.enviar(evento()); });
  expect(result.current.envio.error).toBe('recusado');
  expect(result.current.envio.sending).toBe(false);
});

it('usa mensagem padrão quando a falha não é Error', async () => {
  const { result } = await prepararHook(vi.fn().mockRejectedValue('x'));
  act(() => result.current.alterarTitulo('Manutenção preventiva'));
  await act(async () => { await result.current.enviar(evento()); });
  expect(result.current.envio.error).toBe('Não foi possível lançar a meta.');
});

it('limpa o erro ao trocar de estado', async () => {
  const { result } = await prepararHook();
  await act(async () => { await result.current.enviar(evento()); });
  expect(result.current.envio.error).not.toBe('');
  act(() => result.current.alterarEstado('SP'));
  expect(result.current.envio.error).toBe('');
});

it('mostra erro da consulta de público e permite consultar novamente', async () => {
  vi.mocked(obterPublicoMeta).mockRejectedValue(new Error('sem público'));
  const hook = renderHook(() => useNovaMeta(vi.fn()));
  await waitFor(() => expect(hook.result.current.consulta.audienceError).toBe('sem público'));
  act(() => hook.result.current.consultarNovamente());
  await waitFor(() => expect(obterPublicoMeta).toHaveBeenCalledTimes(2));
});

it('usa mensagem padrão na consulta quando o erro não é Error', async () => {
  vi.mocked(obterPublicoMeta).mockRejectedValue('x');
  const hook = renderHook(() => useNovaMeta(vi.fn()));
  await waitFor(() => expect(hook.result.current.consulta.audienceError).toBe('Não foi possível consultar os participantes.'));
});

it('volta para todos os estados quando a consulta de estados falha', async () => {
  vi.mocked(obterEstadosComGranjas).mockRejectedValue(new Error('x'));
  const hook = renderHook(() => useNovaMeta(vi.fn()));
  await waitFor(() => expect(hook.result.current.consulta.estadosDisponiveis.length).toBeGreaterThan(20));
});

it('zera estados quando não há granjas', async () => {
  vi.mocked(obterEstadosComGranjas).mockResolvedValue([]);
  const hook = renderHook(() => useNovaMeta(vi.fn()));
  await waitFor(() => expect(hook.result.current.consulta.estadosDisponiveis).toEqual([]));
  expect(hook.result.current.formulario.state).toBe('');
});

it('mantém todos os estados quando nenhuma UF conhecida volta', async () => {
  vi.mocked(obterEstadosComGranjas).mockResolvedValue(['XX']);
  const hook = renderHook(() => useNovaMeta(vi.fn()));
  await waitFor(() => expect(hook.result.current.consulta.estadosDisponiveis.length).toBeGreaterThan(20));
});