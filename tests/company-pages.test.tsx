import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
vi.mock('@/context/AdminEnterpriseContext', () => ({ useAdminEnterprise: vi.fn() }));
vi.mock('@/components/complex/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/complex/PerfilUsuario', () => ({ PerfilUsuario: () => null }));
vi.mock('@/components/complex/SeletorEmpresaAdm', () => ({ SeletorEmpresaAdm: () => null }));
vi.mock('@/services/farmService', () => ({ listarGranjas: vi.fn() }));
vi.mock('@/services/rankingService', () => ({ obterRankingGeral: vi.fn(), obterPodioRanking: vi.fn(), sincronizarRanking: vi.fn() }));
vi.mock('@/services/tarefasService', () => ({ listarTodasTarefas: vi.fn() }));
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { listarGranjas } from '@/services/farmService';
import { obterRankingGeral, obterPodioRanking } from '@/services/rankingService';
import { listarTodasTarefas } from '@/services/tarefasService';
import Ranking from '@/pages/Ranking';
import Tarefas from '@/pages/Tarefas';
const farms = [{ id: 10, nome: 'A', regiao: 'SP', idEnterprise: 1 }, { id: 20, nome: 'B', regiao: 'PR', idEnterprise: 2 }];
function selectCompany(id: number | null) {
  vi.mocked(useAdminEnterprise).mockReturnValue({ empresaSelecionada: id, empresas: [], carregando: false, setEmpresaSelecionada: vi.fn() });
}
beforeEach(() => {
  vi.resetAllMocks();
  selectCompany(2);
  vi.mocked(listarGranjas).mockResolvedValue(farms);
  vi.mocked(obterRankingGeral).mockResolvedValue([{ idFarm: 99, farmName: 'Ranking', score: 1, rankPosition: 1 }]);
  vi.mocked(obterPodioRanking).mockResolvedValue([]);
});
afterEach(cleanup);
it('pódio usa granja da empresa e recarrega após trocar para visão global', async () => {
  const { rerender } = render(<Ranking />);
  await waitFor(() => expect(obterPodioRanking).toHaveBeenCalledWith(20, expect.any(AbortSignal)));
  selectCompany(null);
  rerender(<Ranking />);
  await waitFor(() => expect(obterPodioRanking).toHaveBeenLastCalledWith(10, expect.any(AbortSignal)));
});
for (const available of [[], [farms[0]]]) {
  it(`sem granja da empresa mantém pódio vazio (${available.length} disponíveis)`, async () => {
    vi.mocked(listarGranjas).mockResolvedValue(available);
    render(<Ranking />);
    await screen.findByText('Ranking');
    expect(obterPodioRanking).not.toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: 'Pódio de Granjas' })).toBeNull();
  });
}
it('tarefas seguem granjas e regiões da empresa e ficam vazias sem granjas', async () => {
  vi.mocked(listarTodasTarefas).mockResolvedValue([
    { id: 1, tipo: 'individual', idFarm: 10, titulo: 'Individual A', descricao: '', metrica: 'water', status: '', valorAlvo: 1 },
    { id: 2, tipo: 'individual', idFarm: 20, titulo: 'Individual B', descricao: '', metrica: 'water', status: '', valorAlvo: 1 },
    { id: 3, tipo: 'estadual', regiao: 'SP', titulo: 'Estadual SP', descricao: '', metrica: 'water', status: '', valorAlvo: 1 },
    { id: 4, tipo: 'estadual', regiao: 'PR', titulo: 'Estadual PR', descricao: '', metrica: 'water', status: '', valorAlvo: 1 },
  ]);
  const { rerender } = render(<Tarefas />);
  await screen.findByText('Individual B');
  expect(screen.getByText('Estadual PR')).toBeTruthy();
  expect(screen.queryByText('Individual A')).toBeNull();
  expect(screen.queryByText('Estadual SP')).toBeNull();
  selectCompany(1); rerender(<Tarefas />);
  await screen.findByText('Individual A');
  expect(screen.queryByText('Individual B')).toBeNull();
  vi.mocked(listarGranjas).mockResolvedValue([]);
  selectCompany(3); rerender(<Tarefas />);
  await screen.findByText('Nenhuma meta encontrada.');
  selectCompany(null); rerender(<Tarefas />);
  await screen.findByText('Individual B');
  expect(screen.getByText('Individual A')).toBeTruthy();
});
