import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/apiClient', () => ({ fetchComAuth: vi.fn() }));
import { fetchComAuth } from '@/services/apiClient';
import { springRequest } from '@/services/springClient';
const fetchMock = vi.mocked(fetchComAuth);
beforeEach(() => vi.resetAllMocks());
describe('cliente Spring', () => {
  it('serializa dados e parâmetros e interpreta a resposta', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 12 }), { status: 200 }));
    expect(await springRequest('/farms', { method: 'POST', query: { id: 3, vazio: '', ausente: null }, body: { nome: 'A' } })).toEqual({ id: 12 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/farms?id=3');
    expect(init?.body).toBe('{"nome":"A"}');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });
  it('aceita resposta sem conteúdo', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(await springRequest('/farms/1', { method: 'DELETE' })).toBeUndefined();
  });
  it.each([[401, 'Sessão expirada'], [403, 'permissão'], [503, 'indisponível']])('traduz erro HTTP %s', async (status, message) => {
    fetchMock.mockResolvedValue(new Response('', { status }));
    await expect(springRequest('/farms')).rejects.toThrow(message);
  });
  it('preserva detalhe da API e trata falhas de conexão', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Falha específica' }), { status: 400 }));
    await expect(springRequest('/farms')).rejects.toThrow('Falha específica');
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(springRequest('/farms')).rejects.toThrow('conectar ao servidor');
  });
});
