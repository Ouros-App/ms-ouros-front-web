import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MetasCard } from '@/components/complex/MetasCard';
import { RankingCard } from '@/components/complex/RankingCard';
import { RegistroCard } from '@/components/complex/RegistroCard';
import { SimulacoesCard } from '@/components/complex/SimulacaoCard';
beforeAll(() => { HTMLDialogElement.prototype.showModal = function () { this.open = true; }; });
afterEach(cleanup);
const common = () => ({ status: 'pronto' as const, mensagemErro: 'Servidor indisponível', busca: '', ordenacao: 'padrao' as const, onBuscar: vi.fn(), onOrdenar: vi.fn(), onSalvar: vi.fn().mockResolvedValue(undefined), onExcluir: vi.fn().mockResolvedValue(undefined), onRecarregar: vi.fn() });
const cases = [
 { Component: MetasCard, list: { metas: [{ id: '1', estado: 'SP', meta: 'Economia', totalGranjas: 10, concluidos: 4 }] }, edit: 'Editar meta Economia de SP', remove: 'Excluir meta Economia de SP' },
 { Component: RankingCard, list: { participantes: [{ id: '1', nome: 'Ana', pontuacao: 8, atualizadoEm: '2026-01-01', posicao: 1, liga: 'ouro' }] }, edit: 'Editar Ana', remove: 'Excluir Ana' },
 { Component: RegistroCard, list: { registros: [{ id: '1', idLote: 'L1', dataEmissao: '2026-01-01', entraram: 100, sairam: 2, custo: 10, hidrometro: 20 }] }, edit: 'Editar lote L1', remove: 'Excluir lote L1' },
 { Component: SimulacoesCard, list: { simulacoes: [{ id: '1', idLote: 'L1', consumoAtual: 2, consumoAlvo: 1, precoAgua: 3, precoEnergia: 4, quantidadeAves: 100, gastoAlvoEnergia: 2 }] }, edit: 'Editar simulação do lote L1', remove: 'Excluir simulação do lote L1' },
];
for (const spec of cases) {
 describe(spec.edit, () => {
  const mount = (props = common()) => render(<MemoryRouter><spec.Component {...props as never} {...spec.list as never} /></MemoryRouter>);
  it('permite pesquisar, editar e salvar os dados existentes', async () => {
   const props = common(); const view = mount(props);
   fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Ana' } });
   expect(props.onBuscar).toHaveBeenCalledWith('Ana');
   fireEvent.click(screen.getByRole('button', { name: spec.edit }));
   expect(view.container.querySelector('dialog')).toBeTruthy();
   fireEvent.submit(view.container.querySelector('form')!);
   await waitFor(() => expect(props.onSalvar).toHaveBeenCalled());
   await waitFor(() => expect(view.container.querySelector('dialog')).toBeNull());
  });
  it('preserva o diálogo quando salvar falha e permite fechar', async () => {
   const props = common(); props.onSalvar.mockRejectedValue(new Error('Falha ao salvar'));
   const view = mount(props); fireEvent.click(screen.getByRole('button', { name: spec.edit }));
   fireEvent.submit(view.container.querySelector('form')!);
   expect(await screen.findByText('Falha ao salvar')).toBeTruthy();
   fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
   expect(view.container.querySelector('dialog')).toBeNull();
  });
  it('confirma exclusão e mostra falhas sem perder os dados', async () => {
   const props = common(); props.onExcluir.mockRejectedValueOnce(new Error('Falha ao excluir')).mockResolvedValueOnce(undefined);
   const view = mount(props); fireEvent.click(screen.getByRole('button', { name: spec.remove }));
   fireEvent.click(within(view.container.querySelector('dialog')!).getByRole('button', { name: /^Excluir$/ }));
   expect(await screen.findByText('Falha ao excluir')).toBeTruthy();
   fireEvent.click(within(view.container.querySelector('dialog')!).getByRole('button', { name: /^Excluir$/ }));
   await waitFor(() => expect(view.container.querySelector('dialog')).toBeNull());
   expect(props.onExcluir).toHaveBeenCalledWith('1');
  });
  it('exibe carregamento e recuperação de erro', () => {
   const props = common(); const view = mount({ ...props, status: 'carregando' } as never);
   expect(view.container.textContent).toContain('Carregando');
   view.unmount(); mount({ ...props, status: 'erro' } as never);
   fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
   expect(props.onRecarregar).toHaveBeenCalled();
  });
 });
}
