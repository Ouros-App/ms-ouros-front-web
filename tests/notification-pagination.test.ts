import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/services/springClient', () => ({ springRequest: vi.fn() }));
import { springRequest } from '@/services/springClient';
import { listarNotificacoes, marcarTodasComoLidas } from '@/services/notificacaoService';
const request = vi.mocked(springRequest);
const notification = (id: number) => ({ id, title: `Aviso ${id}`, message: 'Consumo', type: 'info', is_read: false, created_at: '2026-01-01' });
afterEach(() => vi.resetAllMocks());
it('busca todas as páginas com tamanho padrão e o mesmo sinal', async () => {
  const signal = new AbortController().signal;
  request.mockResolvedValueOnce({ content: [notification(1)], totalPages: 3 })
    .mockResolvedValueOnce({ content: [notification(2)], totalPages: 3 })
    .mockResolvedValueOnce({ content: [notification(3)], totalPages: 3 });
  expect((await listarNotificacoes(signal)).map(n => n.id)).toEqual([1, 2, 3]);
  for (let page = 0; page < 3; page++) {
    expect(request).toHaveBeenNthCalledWith(page + 1, '/notifications', { query: { page, size: 50 }, signal }, expect.any(String));
  }
});
it('usa last quando o total de páginas não existe', async () => {
  request.mockResolvedValueOnce({ content: [notification(1)], last: false })
    .mockResolvedValueOnce({ content: [notification(2)], last: true });
  expect(await listarNotificacoes()).toHaveLength(2);
});
it('sem metadados, continua até página incompleta e respeita página inicial', async () => {
  request.mockResolvedValueOnce({ content: [notification(1), notification(2)] })
    .mockResolvedValueOnce({ content: [] });
  expect(await listarNotificacoes(undefined, 2, 3)).toHaveLength(2);
  expect(request.mock.calls[1][1]?.query).toEqual({ page: 4, size: 2 });
});
it('propaga abort de uma página intermediária', async () => {
  const controller = new AbortController();
  request.mockResolvedValueOnce({ content: [notification(1)], last: false })
    .mockImplementationOnce(async (_path, init) => {
      expect(init?.signal).toBe(controller.signal);
      throw new DOMException('Aborted', 'AbortError');
    });
  await expect(listarNotificacoes(controller.signal)).rejects.toHaveProperty('name', 'AbortError');
});

it('marca todas as notificações como lidas pela API', async () => {
  await marcarTodasComoLidas();
  expect(request).toHaveBeenCalledWith('/notifications/read-all', { method: 'PATCH' });
});
