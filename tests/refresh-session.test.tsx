import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { executarRenovacaoToken, limparTokens, obterAccessToken, obterRefreshToken, salvarTokens } from '@/services/tokenService';
import { renovarToken, SessaoExpiradaError } from '@/services/authService';
import { CHAVE_SESSAO } from '@/utils/chaves';
import { lerArmazenado, salvarArmazenado } from '@/utils/storage';

const user = { id: '1', name: 'Ana', email: 'a@x.com', role: 'admin', token: 'old', refreshToken: 'r' };
afterEach(() => { cleanup(); limparTokens(); localStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

for (const status of [400, 401, 403, 500, 503]) {
  it(`renovação HTTP ${status} encerra sessão somente para 400/401`, async () => {
    vi.stubEnv('DEV', false);
    salvarTokens({ accessToken: 'old', refreshToken: 'r' });
    const expired = vi.fn();
    window.addEventListener('auth:session_expired', expired);
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status }));
    vi.stubGlobal('fetch', fetcher);
    try {
      if (status === 400 || status === 401) {
        await expect(renovarToken('r')).rejects.toBeInstanceOf(SessaoExpiradaError);
        await expect(executarRenovacaoToken()).resolves.toBeNull();
        expect(obterAccessToken()).toBeNull();
        expect(expired).toHaveBeenCalledTimes(1);
      } else {
        await expect(executarRenovacaoToken()).rejects.toThrow();
        expect(obterAccessToken()).toBe('old');
        expect(obterRefreshToken()).toBeNull();
        expect(expired).not.toHaveBeenCalled();
      }
    } finally {
      window.removeEventListener('auth:session_expired', expired);
    }
  });
}

it('falha de rede preserva tokens e libera a renovação para nova tentativa', async () => {
  vi.stubEnv('DEV', false);
  salvarTokens({ accessToken: 'old', refreshToken: 'r' });
  const fetcher = vi.fn().mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValueOnce(new Response('{"access_token":"new","refresh_token":"r2"}'));
  vi.stubGlobal('fetch', fetcher);
  await expect(executarRenovacaoToken()).rejects.toThrow();
  expect(obterAccessToken()).toBe('old');
  expect(obterRefreshToken()).toBeNull();
  await expect(executarRenovacaoToken()).resolves.toBe('new');
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('renovação sem refresh não deixa mutex bloqueado', async () => {
  limparTokens();
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response('{}', { status: 401 }))
    .mockResolvedValueOnce(new Response('{"access_token":"new"}'));
  vi.stubGlobal('fetch', fetcher);
  expect(await executarRenovacaoToken()).toBeNull();
  salvarTokens({ accessToken: 'old', refreshToken: 'r' });
  await expect(executarRenovacaoToken()).resolves.toBe('new');
});

for (const nextSession of ['logout', 'login'] as const) {
  for (const status of [200, 401]) {
    it(`descarta resposta ${status} de renovação anterior após ${nextSession}`, async () => {
      const { result } = renderHook(useAuth, { wrapper: AuthProvider });
      act(() => result.current.login(user));
      let finish!: (value: Response) => void;
      const fetcher = vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes('/logout')) return Promise.resolve(new Response(null, { status: 204 }));
        return new Promise<Response>((resolve) => { finish = resolve; });
      });
      vi.stubGlobal('fetch', fetcher);
      const renewal = executarRenovacaoToken();
      await waitFor(() => expect(fetcher.mock.calls.some(([input]) => String(input).includes('/token/refresh'))).toBe(true));
      act(() => {
        if (nextSession === 'logout') result.current.logout();
        else result.current.login({ ...user, id: '2', token: 'other', refreshToken: 'other-r' });
      });
      await act(async () => {
        finish(new Response('{"access_token":"stale","refresh_token":"stale-r"}', { status }));
        expect(await renewal).toBeNull();
      });
      expect(obterAccessToken()).toBe(nextSession === 'logout' ? null : 'other');
      expect(result.current.isAuthenticated).toBe(nextSession !== 'logout');
      expect(result.current.user?.token).toBeUndefined();
    });
  }
}

it('perfil persistido não duplica tokens durante login, atualização e renovação', async () => {
  const { result } = renderHook(useAuth, { wrapper: AuthProvider });
  act(() => result.current.login(user));
  expect(lerArmazenado(CHAVE_SESSAO)).not.toHaveProperty('token');
  expect(lerArmazenado(CHAVE_SESSAO)).not.toHaveProperty('refreshToken');
  act(() => result.current.updateUser({ name: 'Bia', token: 'new' }));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"access_token":"renewed","refresh_token":"r2"}')));
  await act(async () => { await executarRenovacaoToken(); });
  expect(obterAccessToken()).toBe('renewed');
  expect(obterRefreshToken()).toBeNull();
  expect(lerArmazenado(CHAVE_SESSAO)).toEqual({ id: '1', name: 'Bia', email: 'a@x.com', role: 'admin' });
});

it('remove duplicações legadas ao restaurar o perfil', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"access_token":"restored"}')));
  salvarArmazenado(CHAVE_SESSAO, user);
  renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(obterAccessToken()).toBe('restored'));
  expect(lerArmazenado(CHAVE_SESSAO)).not.toHaveProperty('token');
  expect(lerArmazenado(CHAVE_SESSAO)).not.toHaveProperty('refreshToken');
});
