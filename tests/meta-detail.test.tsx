import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NovaMetaForm } from '@/components/complex/NovaMetaForm';
import Detalhe from '@/pages/RegistroDetalhe';
vi.mock('@/components/complex/Sidebar', () => ({ Sidebar: () => <nav>Menu</nav> }));
const registroState = vi.hoisted(() => ({ status: 'pronto', mensagemErro: '', registro: { id: '1', idLote: 'L1', dataEmissao: '2026-01-01', hidrometro: 3, custo: 5, entraram: 10, sairam: 2 } }));
vi.mock('@/hooks/useRegistro', () => ({ useRegistro: () => registroState }));
afterEach(cleanup);
it('nova meta valida entrada, informa falha e confirma lançamento', async () => {
 const launch = vi.fn().mockRejectedValueOnce(new Error('Meta duplicada')).mockResolvedValueOnce(27);
 const view = render(<NovaMetaForm onLancar={launch} />);
 fireEvent.submit(view.container.querySelector('form')!); expect(screen.getByText('Informe a meta estadual.')).toBeTruthy();
 fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Economia de água' } });
 fireEvent.submit(view.container.querySelector('form')!); expect(await screen.findByText('Meta duplicada')).toBeTruthy();
 fireEvent.submit(view.container.querySelector('form')!); expect(await screen.findByText('Meta lançada para 27 estados.')).toBeTruthy();
 expect(launch).toHaveBeenCalledWith('Economia de água');
});
it('detalhe apresenta dados do lote e erro de registro ausente', () => {
 const view = render(<MemoryRouter><Detalhe /></MemoryRouter>);
 expect(screen.getByRole('heading', { name: 'Lote L1' })).toBeTruthy(); expect(screen.getByText('Galinhas atuais')).toBeTruthy();
 registroState.registro = null as never;
 view.rerender(<MemoryRouter><Detalhe /></MemoryRouter>); expect(screen.getByText('Registro não encontrado')).toBeTruthy();
});
