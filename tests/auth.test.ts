import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/utils/delay', () => ({ wait: async () => {}, isAbortError: (e: Error) => e?.name === 'AbortError' }));
import { entrar, entrarComGoogle, iniciarLogin, verificarCodigoLogin, renovarToken, mascaraEmail, atualizarUsuarioCadastrado } from '@/services/authService';
import { parseJwt, claimsToUser, salvarTokens, obterAccessToken, obterRefreshToken, limparTokens, isTokenExpirado, executarRenovacaoToken } from '@/services/tokenService';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); limparTokens(); });
it('login e verificação usam contratos HTTP e normalizam o e-mail', async () => {
 const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ challenge_id: 'c1', expires_in: 300, masked_email: 'a***@x.com' }))).mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'abc', refresh_token: 'r' })));
 vi.stubGlobal('fetch', fetcher);
 expect((await iniciarLogin({ email: ' A@X.COM ', password: '123456' })).challenge_id).toBe('c1');
 expect(JSON.parse(fetcher.mock.calls[0][1].body).email).toBe('a@x.com');
 expect((await verificarCodigoLogin({ email: 'a@x.com', password: '123456', challengeId: 'c1', code: '123456' })).access_token).toBe('abc');
});
it('autenticação comunica erros de credenciais, tentativas e expiração', async () => {
 vi.stubEnv('DEV', false); vi.stubEnv('MODE', 'production');
 const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
 for (const status of [401, 429, 400, 500]) {
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Falha' }), { status }));
  await expect(iniciarLogin({ email: 'a@x.com', password: '123456' })).rejects.toThrow();
  fetcher.mockResolvedValueOnce(new Response('{}', { status }));
  await expect(verificarCodigoLogin({ email: 'a@x.com', password: '123456', challengeId: 'c', code: '123456' })).rejects.toThrow();
 }
 fetcher.mockResolvedValueOnce(new Response('{}', { status: 401 }));
 await expect(renovarToken('r')).rejects.toThrow('Sessão expirada');
 fetcher.mockRejectedValueOnce(new Error('offline'));
 await expect(renovarToken('r')).rejects.toThrow();
});
it('modo de desenvolvimento suporta desafio simulado e renovação', async () => {
 vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
 const challenge = await iniciarLogin({ email: 'gestor@ouros.com', password: 'ouros123' });
 expect(challenge.challenge_id).toContain('mock-challenge-');
 await expect(verificarCodigoLogin({ email: 'gestor@ouros.com', password: 'ouros123', challengeId: challenge.challenge_id, code: '000000' })).rejects.toThrow();
 const user = await entrar({ email: 'gestor@ouros.com', password: 'ouros123' });
 expect(user.role).toBe('admin');
 expect((await renovarToken('mock-refresh')).access_token).toBeTruthy();
 await expect(entrar({ email: 'none@x.com', password: 'bad' })).rejects.toThrow();
 await expect(entrarComGoogle()).rejects.toThrow();
 expect(mascaraEmail('ana@x.com')).toBe('a***@x.com');
 expect(mascaraEmail('invalido')).toBe('invalido');
 expect(() => atualizarUsuarioCadastrado('inexistente', { name: 'A' })).toThrow();
});
it('JWT e persistência de tokens respeitam expiração e papéis', async () => {
 const token = `a.${btoa(JSON.stringify({ sub: 'u1', email: 'a@x.com', database_id: '5', roles: ['admin'], exp: Math.floor(Date.now()/1000)+3600 }))}.b`;
 expect(parseJwt(token)?.sub).toBe('u1');
 expect(parseJwt('bad')).toBeNull(); expect(parseJwt('a.bad.b')).toBeNull();
 expect(claimsToUser(parseJwt(token)!, token).role).toBe('admin');
 expect(claimsToUser({}).name).toBe('Usuário');
 salvarTokens({ accessToken: token, refreshToken: 'refresh' });
 expect(obterAccessToken()).toBe(token); expect(obterRefreshToken()).toBe('refresh');
 expect(isTokenExpirado(token)).toBe(false);
 limparTokens(); expect(isTokenExpirado()).toBe(true);
 expect(await executarRenovacaoToken()).toBeNull();
});
