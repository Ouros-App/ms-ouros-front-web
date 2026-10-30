import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { DashboardAiMetrics } from '@/components/complex/DashboardAiMetrics';
import { DashboardFarmsTable } from '@/components/complex/DashboardFarmsTable';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { obterAccessToken } from '@/services/tokenService';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });
it('painel administrativo exibe custos, distribuição e auditoria', async () => {
 const card = { label: 'Tokens', formattedValue: 'R$ 10', periodComparisonText: 'Mês atual' };
 vi.stubGlobal('fetch', vi.fn(async (input) => {
  const url = String(input); let data;
  if(url.includes('/kpis')) data = { tokenSpend: card, unitTokenCost: card, activeUsers: card, avgAccuracyPercent: 98 };
  else if(url.includes('token-spend')) data = { title: 'Gasto por modelo', totalTokens: 1000, points: [{ cohort: 'Pequenas', totalSpendBrl: 10 }] };
  else if(url.includes('latency')) data = { title: 'Latência', p50Ms: 10, p95Ms: 30, avgCostPerPromptBrl: 0.1, buckets: [{ bucket: 'Rápido', sharePercent: 80 }] };
  else data = { items: [{ sessionId: 'sessao-1', model: 'Modelo', topic: 'Consumo', totalTokens: 100, latencyMs: 20, costBrl: 0.1, status: 'ok' }] };
  return new Response(JSON.stringify(data));
 }));
 render(<DashboardAiMetrics enterpriseId={1} />);
 expect(screen.getByText('Carregando telemetria Midas IA...')).toBeTruthy();
 expect(await screen.findByText('sessao-1')).toBeTruthy(); expect(screen.getByText('Gasto por modelo')).toBeTruthy();
});
it('tabela corporativa pesquisa, pagina e recupera falhas', async () => {
 const fetcher = vi.fn().mockResolvedValueOnce(new Response('{}', {status:500})).mockImplementation(async () => new Response(JSON.stringify({ total: 20, items: [{ farm_id: 1, farm_name: 'Granja teste', location: 'São Paulo', state: 'SP', lots_count: 2, total_consumption: '10 m³' }] })));
 vi.stubGlobal('fetch', fetcher); render(<DashboardFarmsTable />);
 fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
 expect(await screen.findByText('Granja teste')).toBeTruthy();
 fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
 await waitFor(() => expect(screen.getByText('Página 2 de 2')).toBeTruthy());
 fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
 fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'teste' } });
 await waitFor(() => expect(fetcher.mock.calls.some(c => String(c[0]).includes('search=teste'))).toBe(true));
});
it('sessão persiste login, sincroniza renovação e limpa logout', () => {
 const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
 vi.stubGlobal('fetch', fetcher);
 const { result } = renderHook(useAuth, { wrapper: AuthProvider });
 expect(result.current.isAuthenticated).toBe(false);
 act(() => result.current.login({ id: '1', name: 'Ana', email: 'a@x.com', token: 't', refreshToken: 'r' }));
 expect(result.current.isAuthenticated).toBe(true);
 act(() => result.current.updateUser({ name: 'Bia', token: 't2' })); expect(result.current.user?.name).toBe('Bia');
 act(() => window.dispatchEvent(new CustomEvent('auth:token_refreshed', { detail: { accessToken: 't3' } })));
 expect(obterAccessToken()).toBe('t3');
 act(() => window.dispatchEvent(new Event('auth:session_expired'))); expect(result.current.isAuthenticated).toBe(false);
 expect(fetcher).toHaveBeenCalledWith('/v1/auth/web/logout', expect.objectContaining({ credentials: 'include' }));
});
