vi.mock('@/services/farmService', () => ({ listarGranjas: vi.fn(async () => [{ id: 4, nome: 'Granja', regiao: 'Sudeste', idEnterprise: 1 }]) }));
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Detalhe from '@/pages/RegistroDetalhe';
vi.mock('@/components/complex/Sidebar', () => ({ Sidebar: () => <nav>Menu</nav> }));
const registroState = vi.hoisted(() => ({ status: 'pronto', mensagemErro: '', registro: { id: '1', idLote: 'L1', dataEmissao: '2026-01-01', hidrometro: 3, custo: 5, entraram: 10, sairam: 2 } }));
vi.mock('@/hooks/useRegistro', () => ({ useRegistro: () => registroState }));
afterEach(cleanup);
it('detalhe apresenta dados do lote e erro de registro ausente', () => {
 const view = render(<MemoryRouter><Detalhe /></MemoryRouter>);
 expect(screen.getByRole('heading', { name: 'Lote L1' })).toBeTruthy(); expect(screen.getByText('Galinhas atuais')).toBeTruthy();
 registroState.registro = null as never;
 view.rerender(<MemoryRouter><Detalhe /></MemoryRouter>); expect(screen.getByText('Registro não encontrado')).toBeTruthy();
});
