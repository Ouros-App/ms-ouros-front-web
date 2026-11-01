import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/springClient', () => ({ springRequest: vi.fn() }));
vi.mock('@/services/farmService', () => ({ listarGranjas: vi.fn() }));
import { springRequest } from '@/services/springClient';
import { listarGranjas } from '@/services/farmService';
import { listarRegistro, obterRegistro, criarRegistro, atualizarRegistro, excluirRegistro } from '@/services/registroService';
import { listarSimulacoes, criarSimulacao, atualizarSimulacao, excluirSimulacao } from '@/services/simulacoesService';

const request = vi.mocked(springRequest);
const farms = vi.mocked(listarGranjas);
const dto = { id: 3, id_lote: 'L1', data_emissao: '2026-01-01', hidrometro: null, custo: 10, entraram: 20, sairam: 1, id_farm: 4, farm_name: 'Granja' };
const dados = { idLote: 'L1', dataEmissao: '2026-01-01', hidrometro: 0, custo: 10, entraram: 20, sairam: 1, idFarm: 4 };
const simDto = { id: 1, id_farm: 4, id_lot: 'L1', current_cgi: 2, target_cgi: 1, water_price: 3, energy_price: 4, poultry_quantity: 100, target_energy_kwh: 5 };
const sim = { idLote: 'L1', consumoAtual: 2, consumoAlvo: 1, precoAgua: 3, precoEnergia: 4, quantidadeAves: 100, gastoAlvoEnergia: 5, idFarm: 4 };

beforeEach(() => { vi.resetAllMocks(); });
describe('serviço de registros', () => {
  it('mapeia e filtra registros recebidos da API', async () => {
    request.mockResolvedValue([dto]);
    expect(await listarRegistro(undefined, { idEnterprise: 7 })).toEqual([expect.objectContaining({ id: '3', idLote: 'L1', hidrometro: 0 })]);
    expect(await obterRegistro('3')).toEqual(expect.objectContaining({ id: '3' }));
    expect(await obterRegistro('outro')).toBeNull();
  });
  it('obterRegistro consome endpoint unitário diretamente quando disponível', async () => {
    request.mockResolvedValueOnce(dto);
    const resultado = await obterRegistro('3');
    expect(resultado).toEqual(expect.objectContaining({ id: '3', idLote: 'L1' }));
    expect(request).toHaveBeenCalledWith('/lots/production-summaries/3', expect.any(Object), expect.any(String));
  });
  it('cria registro com hidrômetro via endpoint agregado', async () => {
    request.mockResolvedValueOnce({ id: 5 }).mockResolvedValueOnce([{ ...dto, id: 5, hidrometro: 120.5 }]);
    const resultado = await criarRegistro({ ...dados, hidrometro: 120.5 });
    expect(resultado.id).toBe('5');
    expect(request).toHaveBeenNthCalledWith(
      1,
      '/lots/aggregated',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ hydrometer_reading: 120.5, received_chickens: 20, id_farm: 4 }),
      }),
      expect.any(String),
    );
  });
  it('cria registro com fallback para /lots se /lots/aggregated falhar', async () => {
    request.mockRejectedValueOnce(new Error('Endpoint não encontrado'))
      .mockResolvedValueOnce({ id: 9 })
      .mockResolvedValueOnce([{ ...dto, id: 9 }]);
    const resultado = await criarRegistro(dados);
    expect(resultado.id).toBe('9');
    expect(request).toHaveBeenNthCalledWith(1, '/lots/aggregated', expect.any(Object), expect.any(String));
    expect(request).toHaveBeenNthCalledWith(2, '/lots', expect.any(Object), expect.any(String));
  });
  it('cria, atualiza e exclui registro', async () => {
    request.mockResolvedValueOnce({ id: 3 }).mockResolvedValueOnce([dto]);
    expect((await criarRegistro(dados)).id).toBe('3');
    request.mockResolvedValueOnce({ id: 3 }).mockResolvedValueOnce([]);
    expect((await atualizarRegistro('3', dados)).id).toBe('3');
    request.mockResolvedValueOnce(undefined);
    await excluirRegistro('3');
    expect(request).toHaveBeenLastCalledWith('/lots/3', { method: 'DELETE' }, expect.any(String));
  });
  it('informa falha ao criar sem granja disponível', async () => {
    farms.mockResolvedValue([]);
    await expect(criarRegistro({ ...dados, idFarm: undefined })).rejects.toThrow('Nenhuma granja');
  });
});
describe('serviço de simulações', () => {
  it('mapeia resultados e persiste operações', async () => {
    request.mockResolvedValueOnce([simDto]).mockResolvedValueOnce(simDto).mockResolvedValueOnce(simDto).mockResolvedValueOnce(undefined);
    expect((await listarSimulacoes())[0]).toEqual(expect.objectContaining({ id: '1', idLote: 'L1' }));
    expect((await criarSimulacao(sim)).consumoAlvo).toBe(1);
    expect((await atualizarSimulacao('1', sim)).idFarm).toBe(4);
    await excluirSimulacao('1');
    expect(request).toHaveBeenLastCalledWith('/farms/simulations/1', { method: 'DELETE' }, expect.any(String));
  });
});
