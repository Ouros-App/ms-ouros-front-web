import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
vi.mock('@/context/AdminEnterpriseContext', () => ({ useAdminEnterprise: vi.fn() }));
vi.mock('@/components/complex/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/complex/PerfilUsuario', () => ({ PerfilUsuario: () => null }));
vi.mock('@/components/complex/SeletorEmpresaAdm', () => ({ SeletorEmpresaAdm: () => null }));
vi.mock('@/services/rankingService', () => ({
  listarRankingPaginado: vi.fn(),
  atualizarParticipante: vi.fn(),
  excluirParticipante: vi.fn(),
}));
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { listarRankingPaginado } from '@/services/rankingService';
import Ranking from '@/pages/Ranking';

function selectCompany(id: number | null) {
  vi.mocked(useAdminEnterprise).mockReturnValue({ empresaSelecionada: id, empresas: [], carregando: false, setEmpresaSelecionada: vi.fn() });
}

beforeEach(() => {
  vi.resetAllMocks();
  selectCompany(2);
  vi.mocked(listarRankingPaginado).mockResolvedValue({ content: [
    { id: '20', nome: 'Granja B', pontuacao: 8.4, atualizadoEm: '2026-10-30T10:00:00', posicao: 1, liga: 'ouro' },
  ], page: 0, size: 10, totalElements: 1, totalPages: 1 });
});
afterEach(cleanup);

it('ranking consulta a empresa selecionada e recarrega ao trocar de empresa', async () => {
  const { rerender } = render(<Ranking />);
  await waitFor(() => expect(listarRankingPaginado).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 10 }), expect.any(AbortSignal), 2));
  expect(await screen.findByText('Granja B')).toBeTruthy();

  selectCompany(1);
  rerender(<Ranking />);
  await waitFor(() => expect(listarRankingPaginado).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, size: 10 }), expect.any(AbortSignal), 1));
});
