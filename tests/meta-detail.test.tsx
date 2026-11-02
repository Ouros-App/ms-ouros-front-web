vi.mock('@/services/farmService', () => ({ listarGranjas: vi.fn(async () => [{ id: 4, nome: 'Granja', regiao: 'Sudeste', idEnterprise: 1 }]) }));
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Detalhe from '@/pages/RegistroDetalhe';
vi.mock('@/components/complex/Sidebar', () => ({ Sidebar: () => <nav>Menu</nav> }));
const registroState = vi.hoisted(() => ({ status: 'pronto', mensagemErro: '', registro: { id: '1', idLote: 'L1', dataEmissao: '2026-01-01', hidrometro: 3, custo: 5, entraram: 10, sairam: 2 } }));
vi.mock('@/hooks/useRegistro', () => ({ useRegistro: () => registroState }));
afterEach(cleanup);

function renderDetalhe() {
  return render(
    <MemoryRouter initialEntries={['/registros/1']}>
      <Routes>
        <Route path="/registros/:id" element={<Detalhe />} />
      </Routes>
    </MemoryRouter>,
  );
}

it('detalhe apresenta dados do lote e erro de registro ausente', () => {
  const view = renderDetalhe();
  expect(screen.getByRole('heading', { name: 'Lote L1' })).toBeTruthy();
  expect(screen.getByText('Galinhas atuais')).toBeTruthy();

  registroState.registro = null as never;
  view.rerender(
    <MemoryRouter initialEntries={['/registros/1']}>
      <Routes>
        <Route path="/registros/:id" element={<Detalhe />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText('Registro não encontrado')).toBeTruthy();
});
