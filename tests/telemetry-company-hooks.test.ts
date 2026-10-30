import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
vi.mock('@/services/telemetryDashboardService', () => ({ getCorporateChartData: vi.fn().mockResolvedValue([]) }));
import { getCorporateChartData } from '@/services/telemetryDashboardService';
import { useGraficosTelemetryConjunto } from '@/hooks/useGraficosTelemetry';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('conjunto de gráficos propaga empresa e recarrega na troca', async () => {
  const { result, rerender } = renderHook(({ enterpriseId }) => useGraficosTelemetryConjunto({ periodo: '2026-01', estado: 'SP', gerencia: 'Norte', enterpriseId }), { initialProps: { enterpriseId: 1 } });
  await waitFor(() => expect(result.current.status).toBe('pronto'));
  expect(getCorporateChartData).toHaveBeenCalledTimes(4);
  for (const call of vi.mocked(getCorporateChartData).mock.calls) {
    expect(call[1]).toEqual({ periodo: '2026-01', estado: 'SP', gerencia: 'Norte', enterpriseId: 1 });
  }
  rerender({ enterpriseId: 2 });
  await waitFor(() => expect(getCorporateChartData).toHaveBeenCalledTimes(8));
  expect(vi.mocked(getCorporateChartData).mock.calls[7][1]?.enterpriseId).toBe(2);
});
