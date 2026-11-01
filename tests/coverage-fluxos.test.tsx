import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MetasResumo } from '@/components/complex/MetasResumo';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import * as notificacoes from '@/services/notificacaoService';

vi.mock('@/services/notificacaoService', () => ({ contarNaoLidas: vi.fn(), listarNotificacoes: vi.fn(), marcarComoLida: vi.fn(), marcarTodasComoLidas: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('resumo mostra carregamento, erro recuperável e progresso', () => {
 const recarregar = vi.fn();
 const props = { resumo: null, status: 'carregando' as const, mensagemErro: '', onRecarregar: recarregar, onLancar: vi.fn() };
 const view = render(<MetasResumo {...props} />);
 expect(screen.getByText('Carregando resumo...')).toBeTruthy();
 view.rerender(<MetasResumo {...props} status="erro" />);
 expect(screen.getByRole('alert').textContent).toContain('Não foi possível carregar');
 fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
 expect(recarregar).toHaveBeenCalledOnce();
 view.rerender(<MetasResumo {...props} status="pronto" resumo={{ total: 4, concluidas: 2, percentual: 50 }} />);
 expect(screen.getByText('2 de 4')).toBeTruthy();
 expect(screen.getByRole('progressbar', { name: 'Metas completadas' }).getAttribute('aria-valuenow')).toBe('2');
 view.rerender(<MetasResumo {...props} status="pronto" resumo={{ total: 0, concluidas: 0, percentual: 0 }} />);
 expect(screen.getByText('0 de 0')).toBeTruthy();
});

it('marcar todas atualiza lista e contagem somente após sucesso e informa falha', async () => {
 vi.mocked(notificacoes.contarNaoLidas).mockResolvedValue(2);
 vi.mocked(notificacoes.listarNotificacoes).mockResolvedValue([{ id: 1, titulo: 'Aviso', mensagem: 'Teste', tipo: 'info', lida: false, criadaEm: '2026-01-01' }]);
 const { result } = renderHook(useNotificacoes);
 await waitFor(() => expect(result.current.naoLidas).toBe(2));
 await act(async () => result.current.carregarLista());
 vi.mocked(notificacoes.marcarTodasComoLidas).mockRejectedValueOnce(new Error('Falha ao marcar'));
 await act(async () => result.current.marcarTodas());
 expect(result.current.mensagemErro).toBe('Falha ao marcar');
 expect(result.current.naoLidas).toBe(2);
 expect(result.current.notificacoes[0].lida).toBe(false);
 vi.mocked(notificacoes.marcarTodasComoLidas).mockResolvedValueOnce();
 await act(async () => result.current.marcarTodas());
 expect(result.current.naoLidas).toBe(0);
 expect(result.current.notificacoes[0].lida).toBe(true);
 expect(result.current.mensagemErro).toBe('');
});
