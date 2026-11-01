import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/services/springClient', () => ({ springRequest: vi.fn() }));
import { springRequest } from '@/services/springClient';
import { criarRegistro, atualizarRegistro } from '@/services/registroService';
import { criarSimulacao } from '@/services/simulacoesService';
import { atualizarPerfil } from '@/services/perfilService';
import { lancarMetaEstadual } from '@/services/metasService';
const request = vi.mocked(springRequest);
const record = { idLote: 'AUTO', dataEmissao: '2026-01-01', hidrometro: 125, custo: 10, entraram: 100, sairam: 10, idFarm: 4 };
beforeEach(() => vi.resetAllMocks());

it('cria uma única vez e envia a leitura no cadastro agregado', async () => {
  request.mockResolvedValueOnce({ id: 7 });
  expect(await criarRegistro(record)).toMatchObject({ id: '7', idLote: 'L-7' });
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith('/lots/aggregated', expect.objectContaining({ body: expect.objectContaining({ id_farm: 4, hydrometer_reading: 125 }) }), expect.any(String));
});
it('propaga falha do cadastro sem tentar um segundo POST', async () => {
  request.mockRejectedValueOnce(new Error('offline'));
  await expect(criarRegistro(record)).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(1);
});
it('exige granja explícita antes de gravar', async () => {
  await expect(criarRegistro({ ...record, idFarm: undefined })).rejects.toThrow('Selecione');
  await expect(criarSimulacao({} as never)).rejects.toThrow('Selecione');
  expect(request).not.toHaveBeenCalled();
});
it('preserva as perdas ao editar o total de saídas', async () => {
  request.mockResolvedValueOnce({ losts: 3 }).mockResolvedValueOnce({ id: 7 });
  await atualizarRegistro('7', record);
  expect(request).toHaveBeenLastCalledWith('/lots/7', expect.objectContaining({ body: expect.objectContaining({ delivered_chickens: 7 }) }), expect.any(String));
});
it('atualiza o perfil autenticado sem usar o ID de uma tabela de outro perfil', async () => {
  request.mockResolvedValueOnce({ id: 1, name: 'Ana', email: 'a@example.com' });
  await atualizarPerfil('1', { nome: 'Ana', email: 'a@example.com', telefone: '', avatarUrl: null });
  expect(request).toHaveBeenCalledWith('/company-employees/me', expect.objectContaining({ method: 'PATCH' }), expect.any(String));
});
it('não inventa granja nem valor alvo para criar uma meta', async () => {
  await expect(lancarMetaEstadual('Economizar água')).rejects.toThrow('Informe');
  expect(request).not.toHaveBeenCalled();
});

it('cria uma única meta por UF sem enviar uma granja arbitrária', async () => {
  request.mockResolvedValueOnce({ id: 1, state: 'SP', id_enterprise: 2, participants_count: 3 });
  const result = await lancarMetaEstadual('Economizar água', { state: 'SP', targetValue: 12.5, dateEnd: '2027-01-01' });
  expect(result.participants_count).toBe(3);
  expect(request).toHaveBeenCalledWith('/state-goals/by-state', expect.objectContaining({
    body: expect.objectContaining({ state: 'SP', goal: expect.objectContaining({ target_value: 12.5 }) }),
  }));
  expect(request).toHaveBeenCalledTimes(1);
});
