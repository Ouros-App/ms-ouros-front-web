import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
vi.mock('@/services/metasService', async (original) => ({ ...await original<typeof import('@/services/metasService')>(), obterPublicoMeta: vi.fn() }));
vi.mock('@/context/AdminEnterpriseContext', () => ({ useAdminEnterprise: vi.fn() }));
import { obterPublicoMeta } from '@/services/metasService';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { AuthContext } from '@/context/AuthContext';
import { NovaMetaForm } from '@/components/complex/NovaMetaForm';
const preview = vi.mocked(obterPublicoMeta);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useAdminEnterprise).mockReturnValue({ empresas: [], empresaSelecionada: null, carregando: false, setEmpresaSelecionada: vi.fn() });
});
afterEach(cleanup);
function fill() {
  fireEvent.change(screen.getByLabelText('Título da meta'), { target: { value: 'Economizar água' } });
  fireEvent.change(screen.getByLabelText('Valor alvo de consumo de água (m³)'), { target: { value: '12.5' } });
  fireEvent.change(screen.getByLabelText('Prazo'), { target: { value: '2099-01-01' } });
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'SP' } });
}
it('prevê público e informa a quantidade efetivamente vinculada retornada pelo servidor', async () => {
  preview.mockResolvedValue({ state: 'SP', id_enterprise: 2, participants_count: 3 });
  const launch = vi.fn().mockResolvedValue(4);
  render(<NovaMetaForm onLancar={launch} />); fill();
  expect(await screen.findByText(/3 granja\(s\) de SP receberão/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Lançar meta estadual' }));
  expect(await screen.findByText(/Meta criada para 4 granja/)).toBeTruthy();
  expect(launch).toHaveBeenCalledWith('Economizar água', { state: 'SP', targetValue: 12.5, dateEnd: '2099-01-01', idEnterprise: null });
});
it('bloqueia público vazio, permite repetir uma consulta com erro e preserva falha de gravação', async () => {
  preview.mockRejectedValueOnce(new Error('Falha na prévia')).mockResolvedValueOnce({ state: 'SP', id_enterprise: 2, participants_count: 0 });
  const launch = vi.fn();
  render(<NovaMetaForm onLancar={launch} />); fill();
  expect(await screen.findByText('Falha na prévia')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Consultar novamente' }));
  expect(await screen.findByText(/Nenhuma granja elegível/)).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Lançar meta estadual' }) as HTMLButtonElement).disabled).toBe(true);
  expect(launch).not.toHaveBeenCalled();
});
it('mantém dados do formulário quando a gravação falha e valida título e prazo', async () => {
  preview.mockResolvedValue({ state: 'SP', id_enterprise: 2, participants_count: 3 });
  const launch = vi.fn().mockRejectedValue(new Error('Erro de gravação'));
  const view = render(<NovaMetaForm onLancar={launch} />); fill();
  await screen.findByText(/3 granja\(s\) de SP receberão/);
  fireEvent.change(screen.getByLabelText('Título da meta'), { target: { value: '' } });
  fireEvent.submit(view.container.querySelector('form')!);
  expect(screen.getByText('Informe a meta estadual.')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Título da meta'), { target: { value: 'Economizar água' } });
  fireEvent.change(screen.getByLabelText('Prazo'), { target: { value: '2000-01-01' } });
  fireEvent.submit(view.container.querySelector('form')!);
  expect(screen.getByText(/um prazo a partir de hoje/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Prazo'), { target: { value: '2099-01-01' } });
  fireEvent.submit(view.container.querySelector('form')!);
  expect(await screen.findByText('Erro de gravação')).toBeTruthy();
  expect((screen.getByLabelText('Título da meta') as HTMLInputElement).value).toBe('Economizar água');
});
it('ignora prévia antiga ao trocar de estado', async () => {
  let resolveOld!: (value: { state: string; id_enterprise: number; participants_count: number }) => void;
  preview.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
    .mockResolvedValueOnce({ state: 'RJ', id_enterprise: 2, participants_count: 1 });
  render(<NovaMetaForm onLancar={vi.fn()} />); fill();
  await waitFor(() => expect(preview).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'RJ' } });
  await screen.findByText(/1 granja\(s\) de RJ receberão/);
  await act(async () => resolveOld({ state: 'SP', id_enterprise: 2, participants_count: 99 }));
  expect(screen.queryByText(/99 granja/)).toBeNull();
});
it('exige empresa para ADM e envia o escopo selecionado na prévia', async () => {
  const session = { user: { id: '1', role: 'admin', name: 'ADM', email: 'adm@example.com' } } as never;
  const view = render(<AuthContext.Provider value={session}><NovaMetaForm onLancar={vi.fn()} /></AuthContext.Provider>);
  expect((screen.getByLabelText('Estado') as HTMLSelectElement).disabled).toBe(true);
  expect(preview).not.toHaveBeenCalled();
  vi.mocked(useAdminEnterprise).mockReturnValue({ empresas: [], empresaSelecionada: 2, carregando: false, setEmpresaSelecionada: vi.fn() });
  preview.mockResolvedValue({ state: 'SP', id_enterprise: 2, participants_count: 2 });
  view.rerender(<AuthContext.Provider value={session}><NovaMetaForm onLancar={vi.fn()} /></AuthContext.Provider>);
  fill();
  await screen.findByText(/2 granja\(s\) de SP receberão/);
  expect(preview).toHaveBeenLastCalledWith('SP',2,expect.any(AbortSignal));
});
