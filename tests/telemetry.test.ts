import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/services/apiClient', () => ({ fetchComAuth: vi.fn() }));
import { fetchComAuth } from '@/services/apiClient';
import { getCorporateChartData, getCorporateFilters, getCorporateFarms, getCorporateKpis } from '@/services/telemetryDashboardService';
const fetcher = vi.mocked(fetchComAuth);
beforeEach(() => vi.resetAllMocks());
const calls = [() => getCorporateKpis({ periodo: '2026-01', estado: 'SP', gerencia: 'Norte', enterpriseId: 3 }), () => getCorporateFilters(), () => getCorporateChartData('monthly-cost', { periodo: 'atual', estado: 'todos' }), () => getCorporateFarms({ search: 'A', sortBy: 'cost', order: 'asc', page: 2, limit: 10, state: 'SP', management: 'Norte', month: '2026-01', enterpriseId: 3 })];
for (const [index, call] of calls.entries()) {
 it(`telemetria ${index}: transmite os dados e trata status HTTP`, async () => {
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ value: 5 }), { status: 200 }));
  expect(await call()).toEqual({ value: 5 });
  expect(fetcher.mock.calls[0][1]?.method).toBe('GET');
  for (const status of [401, 403, 404, 500]) {
   fetcher.mockResolvedValueOnce(new Response('', { status }));
   await expect(call()).rejects.toThrow();
  }
  fetcher.mockRejectedValueOnce(new Error('offline'));
  await expect(call()).rejects.toThrow();
 });
}
