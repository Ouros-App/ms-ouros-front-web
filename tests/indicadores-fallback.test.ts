import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/services/farmService', () => ({ listarGranjas: vi.fn() }));
vi.mock('@/services/rankingService', () => ({ obterRankingGranja: vi.fn() }));
vi.mock('@/services/simulacoesService', () => ({ listarSimulacoes: vi.fn() }));
vi.mock('@/services/springClient', () => ({ springRequest: vi.fn() }));
import { listarGranjas } from '@/services/farmService';
import { obterRankingGranja } from '@/services/rankingService';
import { listarSimulacoes } from '@/services/simulacoesService';
import { springRequest } from '@/services/springClient';
import { obterIndicadoresSimulacao } from '@/services/indicadoresService';

beforeEach(() => {
 vi.resetAllMocks();
 vi.mocked(listarGranjas).mockResolvedValue([{ id: 3, idEnterprise: 7 }] as never);
 vi.mocked(obterRankingGranja).mockResolvedValue({ idFarm: 3, posicao: 2, score: 5 });
 vi.mocked(listarSimulacoes).mockResolvedValue([{ quantidadeAves: 10, gastoAlvoEnergia: 20 }] as never);
});
it('recorre às medições de água quando a métrica está indisponível', async () => {
 vi.mocked(springRequest).mockRejectedValueOnce(new Error('indisponível')).mockResolvedValueOnce([{ start_hydrometer: 10, end_hydrometer: 40 }, { start_hydrometer: 9, end_hydrometer: 8 }]);
 expect(await obterIndicadoresSimulacao(undefined, { idEnterprise: 7 })).toMatchObject({ consumo: 30, litrosPorAve: 3, kwhPorAve: 2, posicao: 2 });
 expect(springRequest).toHaveBeenLastCalledWith('/water-registries', expect.objectContaining({ query: { farm_id: 3 } }));
});
it('não usa fallback após cancelamento', async () => {
 vi.mocked(springRequest).mockRejectedValueOnce(new DOMException('Cancelado', 'AbortError'));
 await expect(obterIndicadoresSimulacao()).rejects.toHaveProperty('name', 'AbortError');
 expect(springRequest).toHaveBeenCalledTimes(1);
});
