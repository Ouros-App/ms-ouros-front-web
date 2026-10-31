import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/utils/delay', () => ({ wait: async () => {}, isAbortError: (e: Error) => e?.name === 'AbortError' }));
import * as metas from '@/services/metas.Service';
import * as ranking from '@/services/rankingService';
import * as reset from '@/services/passwordResetService';
import * as perfil from '@/services/perfilService';
import * as ai from '@/services/adminAiMetricsService';
import { salvarTokens, limparTokens, executarRenovacaoToken, obterAccessToken } from '@/services/tokenService';
import { fetchComAuth } from '@/services/apiClient';
afterEach(() => { vi.unstubAllGlobals(); limparTokens(); localStorage.clear(); });
it('metas persistem na API e calculam resumo pelos status reais', async () => {
 const fetcher = vi.fn(async (_url: unknown, _init?: RequestInit) => new Response(JSON.stringify({content: [], totalElements: 2, totalPages: 1, page: 0, size: 10, statusCounts: { COMPLETED: 1, Pendente: 1 }})));
 vi.stubGlobal('fetch', fetcher);
 await metas.lancarMetaEstadual('Teste de consumo', { idFarm: 4, targetValue: 12.5 });
 expect(JSON.parse((fetcher.mock.calls[0][1]?.body as string)).target_value).toBe(12.5);
 await metas.atualizarMeta('1', { meta: 'Atualizada', concluidos: 0, totalGranjas: 12.5 });
 await metas.excluirMeta('1');
 expect((await metas.obterResumoMetas()).percentual).toBe(50);
});
it('ranking mantém edição local, aceita participantes da API e calcula previsão remota', async () => {
 const list = await ranking.listarParticipantes(); expect(list.length).toBeGreaterThan(0);
 expect((await ranking.atualizarParticipante(list[0].id, { nome: 'Ana', pontuacao: 10 })).nome).toBe('Ana');
 expect(await ranking.atualizarParticipante('ausente', { nome: 'A', pontuacao: 1 })).toMatchObject({ id: 'ausente', nome: 'A', pontuacao: 1 });
 await ranking.excluirParticipante(list[0].id); expect((await ranking.listarParticipantes()).some(p => p.id === list[0].id)).toBe(false);
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ rank_position: 1, score: 8 }))));
 expect((await ranking.obterRankingGranja(1)).posicao).toBe(1);
 expect(ranking.paraPrevisao({ current_position: 3, simulated_position: 2, positions_gained: 1, simulated_league: 'ouro', total_farms: 5 })?.posicoesGanhas).toBe(1);
});
it('redefinição serializa cada etapa e traduz erros da API', async () => {
 const fetcher = vi.fn().mockImplementation(async () => new Response('{"reset_token":"r","message":"ok"}'));
 vi.stubGlobal('fetch', fetcher);
 await reset.iniciarRedefinicaoSenha(' A@X.COM '); expect(JSON.parse((fetcher.mock.calls[0][1]?.body as string)).email).toBe('a@x.com');
 await reset.verificarCodigoRedefinicao({ email: 'a@x.com', challengeId: 'c', code: '123456' });
 await reset.confirmarRedefinicaoSenha({ resetToken: 'r', novaSenha: 'Abcd1234!' });
 for(const status of [400,429,503]) { fetcher.mockResolvedValueOnce(new Response('{}', { status })); await expect(reset.iniciarRedefinicaoSenha('a@x.com')).rejects.toThrow(); }
 fetcher.mockRejectedValueOnce(new Error('offline')); await expect(reset.iniciarRedefinicaoSenha('a@x.com')).rejects.toThrow();
});
it('perfil aceita foto persistível e rejeita telefone inválido', async () => {
 const dto = { id: 1, name: 'Ana', email: 'a@x.com', telephone: '11999999999', photo_url: 'https://x.com/old.png' };
 const fetcher = vi.fn(async () => new Response(JSON.stringify(dto)));
 vi.stubGlobal('fetch', fetcher);
 expect((await perfil.obterPerfil())?.nome).toBe('Ana');
 expect((await perfil.atualizarPerfil('1', { nome: 'Ana', email: 'a@x.com', telefone: '11999999999', avatarUrl: 'https://x.com/a.png' })).id).toBe('1');
 const removed = await perfil.atualizarPerfil('1', { nome: 'Ana', email: 'a@x.com', telefone: '11999999999', avatarUrl: null });
 expect(removed.avatarUrl).toBeNull();
 expect(JSON.parse((fetcher.mock.calls.at(-1) as unknown as [string, RequestInit])[1].body as string).photo_url).toBe('');
 await expect(perfil.atualizarPerfil('1', { nome: 'Ana', email: 'a@x.com', telefone: '1', avatarUrl: null })).rejects.toThrow();
});
for (const [index, call] of [() => ai.getAdminAiKpis(1), () => ai.getAdminAiTokenSpend(1), () => ai.getAdminAiLatency(1), () => ai.getAdminAiSessions({ page: 1, limit: 10, search: 'a', enterpriseId: 1 })].entries()) {
 it(`métricas administrativas ${index} preservam dados e falhas`, async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"ok":true}')).mockResolvedValueOnce(new Response('{}',{status:500})).mockRejectedValueOnce(new Error('offline')));
  expect(await call()).toEqual({ ok: true }); await expect(call()).rejects.toThrow(); await expect(call()).rejects.toThrow();
 });
}
it('renovação compartilha requisição e repete chamada após 401', async () => {
 salvarTokens({ accessToken: 'old', refreshToken: 'r' });
 const fetcher = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify(url.includes('refresh') ? { access_token: 'new', refresh_token: 'r2' } : { ok: true })));
 vi.stubGlobal('fetch', fetcher);
 const values = await Promise.all([executarRenovacaoToken(), executarRenovacaoToken()]); expect(values).toEqual(['new','new']); expect(obterAccessToken()).toBe('new');
 expect(fetcher).toHaveBeenCalledTimes(1);
 fetcher.mockResolvedValueOnce(new Response('', {status:401})).mockResolvedValueOnce(new Response('{"access_token":"new2"}')).mockResolvedValueOnce(new Response('{}'));
 expect((await fetchComAuth('/data')).ok).toBe(true);
});
