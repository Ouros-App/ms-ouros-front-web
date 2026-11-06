import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DashboardAiMetrics } from '@/components/complex/DashboardAiMetrics';
import { getPrometheusAiCharts } from '@/services/adminAiMetricsService';
import { ServiceError } from '@/services/authService';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { AdminEnterpriseProvider } from '@/context/AdminEnterpriseContext';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { isFarmOwner } from '@/services/tokenService';
import DashboardPage from '@/pages/Dashboard';

// Mock useAuth com perfil de administrador
const mockUser = { id: '1', name: 'Admin Geral', email: 'adm@ouros.com', role: 'admin', accountType: 'admin' };
const mockLogout = vi.fn();
let activeAuthUser: typeof mockUser | null = mockUser;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: activeAuthUser,
    isAuthenticated: activeAuthUser !== null,
    isInitializing: false,
    login: vi.fn(),
    logout: mockLogout,
    updateUser: vi.fn(),
  }),
}));

vi.mock('@/components/complex/GraficosDashboard', () => ({
  GraficosDashboard: () => null,
}));

// Mock Recharts ResponsiveContainer to avoid layout dimensions issues in JSDOM
vi.mock('recharts', async () => {
  const original = await vi.importActual<Record<string, unknown>>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 300 }}>
        {children}
      </div>
    ),
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  activeAuthUser = mockUser;
});

describe('Dashboard IA e Governança ADM', () => {
  it('consulta os cinco gráficos Prometheus e renderiza as séries reais', async () => {
    const charts = [
      ['ai-request-rate', 'Requests por segundo', [{ time: '12:00', value: 0 }]],
      ['ai-p95-latency', 'Latência p95 por rota', [{ label: '/chat', value: 0.25 }]],
      ['ai-chat-outcomes', 'Chat por resultado', [{ label: 'success', value: 2 }]],
      ['ai-agent-usage', 'Uso de agentes', [{ label: 'agent-a', value: 1 }]],
      ['ai-tool-usage', 'Uso de tools', [{ label: 'tool-a', value: 1 }]],
    ] as const;
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/v1/admin/ai-metrics/kpis')) {
        return new Response(JSON.stringify({
          token_spend: { value: 1.25, formatted: 'US$ 1,25', unit: 'US$', year: null, period: '2026-11' },
          total_tokens: { value: 1250, formatted: '1.250', unit: 'tokens', year: null, period: '2026-11' },
          unit_cost: { value: 1, formatted: 'US$ 1,00', unit: 'US$/1k tokens', year: null, period: '2026-11' },
          active_users: { value: 2, formatted: '2', unit: 'usuários', year: 2026, period: null },
          inter_agent_latency: { value: 1954.63, formatted: '1954.63', unit: 'ms', year: null, period: '2026-11' },
          average_response_latency: { value: 1663.86, formatted: '1663.86', unit: 'ms', year: null, period: '2026-11' },
          total_response_time: { value: 18.2, formatted: '18.20', unit: 's', year: null, period: '2026-11' },
          error_rate: { value: 0, formatted: '0.00', unit: '%', year: null, period: '2026-11' },
          cost_per_resolution: { value: 3.5, formatted: 'R$ 3,50', unit: 'R$/resolução', year: null, period: '2026-11' },
          estimated_roi: { value: 120, formatted: '120%', unit: '%', year: null, period: '2026-11' },
        }));
      }
      const chartId = charts.find(([id]) => url.includes(`/${id}/data`))?.[0];
      const chart = charts.find(([id]) => id === chartId);
      if (!chart) return new Response('{}', { status: 404 });
      return new Response(JSON.stringify({
        dashboard_id: 'prometheus-ai',
        chart: { id: chart[0], title: chart[1], type: chart[0] === 'ai-request-rate' ? 'line' : 'bar' },
        items: chart[2],
      }));
    });
    vi.stubGlobal('fetch', fetcher);

    render(<DashboardAiMetrics />);

    expect(await screen.findByRole('heading', { name: /Requests por segundo/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Latência p95 por rota \(ms\)/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Chat por resultado \(solicitações\/5 min\)/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Uso de agentes \(eventos\/5 min\)/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Uso de tools \(eventos\/5 min\)/ })).toBeTruthy();
    expect(await screen.findByText('1.250')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Tokens no mês' })).toBeTruthy();
    expect(await screen.findByText('R$ 3,50')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Custo por resolução' })).toBeTruthy();
    expect(screen.getByText('120%')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /ROI estimado/ })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Duração média de execução dos agentes' }).textContent).toContain('1954.63');
    expect(screen.getByRole('region', { name: 'Latência média de resposta' }).textContent).toContain('1663.86');
    expect(screen.getByRole('region', { name: 'Tempo acumulado das respostas do chat' }).textContent).toContain('18.20');
    expect(screen.getByRole('region', { name: 'Taxa de erros 5xx do chat' }).textContent).toContain('0.00');
    expect(fetcher).toHaveBeenCalledTimes(6);
    fireEvent.change(screen.getByLabelText('Mês dos KPIs'), { target: { value: '2024-02' } });
    await waitFor(() => {
      expect(fetcher.mock.calls.some(([url]) => String(url).includes('month=2024-02'))).toBe(true);
    });
  });

  it('projects the target user count and marks only scalable charts as estimates', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/v1/admin/ai-metrics/kpis')) {
        return new Response(JSON.stringify({
          token_spend: { value: 1.25, formatted: 'US$ 1,25', unit: 'US$', year: null, period: '2026-11' },
          total_tokens: { value: 1250, formatted: '1.250', unit: 'tokens', year: null, period: '2026-11' },
          unit_cost: { value: 1, formatted: 'US$ 1,00', unit: 'US$/1k tokens', year: null, period: '2026-11' },
          active_users: { value: 10, formatted: '10', unit: 'usuários', year: 2026, period: null },
        }));
      }
      const chartId = url.split('/charts/')[1]?.split('/data')[0] ?? 'unknown';
      return new Response(JSON.stringify({
        dashboard_id: 'prometheus-ai',
        chart: { id: chartId, title: chartId, type: 'bar' },
        items: [{ label: 'success', value: 1 }],
      }));
    });
    vi.stubGlobal('fetch', fetcher);

    render(<DashboardAiMetrics simulation />);
    fireEvent.change(screen.getByLabelText('Usuários na simulação'), { target: { value: '20' } });

    expect((await screen.findByRole('region', { name: 'Custo estimado de tokens' })).textContent).toContain('2,50');
    expect(screen.getByRole('region', { name: 'Tokens estimados' }).textContent).toContain('2.500');
    expect(screen.getByRole('region', { name: 'Custo por 1k tokens' }).textContent).toContain('1,00');
    expect(screen.getByRole('region', { name: 'Base simulada' }).textContent).toContain('20');
    expect(screen.queryByRole('heading', { name: /ai-request-rate/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /ai-chat-outcomes/ })).toBeNull();
    expect(await screen.findByRole('heading', { name: /ai-agent-usage.*estimativa/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /ai-p95-latency/ })).toBeTruthy();
  });

  it('uses the new current month when clearing the selector after a month rollover', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-31T23:59:59.000Z'));
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/v1/admin/ai-metrics/kpis')) {
        return new Response(JSON.stringify({
          token_spend: { value: 1, formatted: '1', unit: 'R$', year: null, period: '2026-10' },
          total_tokens: { value: 1, formatted: '1', unit: 'tokens', year: null, period: '2026-10' },
          unit_cost: { value: 1, formatted: '1', unit: 'R$/1k tokens', year: null, period: '2026-10' },
          active_users: { value: 1, formatted: '1', unit: 'usuários', year: 2026, period: null },
        }));
      }
      const chartId = url.match(/charts\/([^/]+)\/data/)?.[1] ?? 'ai-request-rate';
      return new Response(JSON.stringify({
        dashboard_id: 'prometheus-ai',
        chart: { id: chartId, title: chartId, type: 'line' },
        items: [],
      }));
    });
    vi.stubGlobal('fetch', fetcher);

    render(<DashboardAiMetrics />);
    await waitFor(() => {
      expect(fetcher.mock.calls.some(([url]) => String(url).includes('month=2026-10'))).toBe(true);
    });

    vi.setSystemTime(new Date('2026-11-01T00:00:01.000Z'));
    fireEvent.change(screen.getByLabelText('Mês dos KPIs'), { target: { value: '' } });

    await waitFor(() => {
      expect(fetcher.mock.calls.some(([url]) => String(url).includes('month=2026-11'))).toBe(true);
    });
  });

  it('mantém os gráficos disponíveis e identifica cada consulta Prometheus que falhou', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/v1/admin/ai-metrics/kpis')) {
        return new Response(JSON.stringify({
          token_spend: { value: null, formatted: 'Sem dados', unit: 'US$', year: null, period: '2026-11' },
          total_tokens: { value: null, formatted: 'Sem dados', unit: 'tokens', year: null, period: '2026-11' },
          unit_cost: { value: null, formatted: 'Sem dados', unit: 'US$/1k tokens', year: null, period: '2026-11' },
          active_users: { value: 2, formatted: '2', unit: 'usuários', year: 2026, period: null },
          inter_agent_latency: { value: 180, formatted: '180.00', unit: 'ms', year: null, period: '2026-11' },
          average_response_latency: { value: 250, formatted: '250.00', unit: 'ms', year: null, period: '2026-11' },
          total_response_time: { value: 1, formatted: '1.00', unit: 's', year: null, period: '2026-11' },
          error_rate: { value: 0, formatted: '0.00', unit: '%', year: null, period: '2026-11' },
          cost_per_resolution: { value: null, formatted: 'N/D', unit: 'R$/resolução', year: null, period: '2026-11' },
          estimated_roi: { value: null, formatted: 'N/D', unit: '%', year: null, period: '2026-11' },
        }));
      }
      const chartId = url.match(/charts\/([^/]+)\/data/)?.[1];
      if (chartId === 'ai-agent-usage') return new Response('{}', { status: 503 });
      return new Response(JSON.stringify({
        dashboard_id: 'prometheus-ai',
        chart: { id: chartId, title: chartId === 'ai-request-rate' ? 'Requests por segundo' : chartId, type: 'bar' },
        items: [{ label: 'success', value: 1 }],
      }));
    });
    vi.stubGlobal('fetch', fetcher);

    render(<DashboardAiMetrics />);

    expect(await screen.findByRole('heading', { name: /Requests por segundo/ })).toBeTruthy();
    await waitFor(() => {
      expect(screen.getAllByText('N/D')).toHaveLength(2);
    });
    expect(screen.getByRole('list', { name: 'Gráficos com falha' }).textContent).toContain('ai-agent-usage');
    expect(screen.getByRole('heading', { name: /ai-chat-outcomes/ })).toBeTruthy();
  });

  it('preserva o status HTTP quando todas as consultas Prometheus falham', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));

    await expect(getPrometheusAiCharts()).rejects.toMatchObject({
      status: 503,
      message: 'Erro ao carregar dados Prometheus (503)',
    } satisfies Partial<ServiceError>);
  });

  it('propaga o cancelamento das consultas Prometheus', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')));
    const controller = new AbortController();
    controller.abort();

    await expect(getPrometheusAiCharts(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('SeletorEmpresaAdm renderiza apenas para administradores e permite seleção de empresa', async () => {
    const fetcher = vi.fn().mockImplementation(async (input: string | URL | Request) => {
      if (String(input).includes('/enterprises')) {
        return new Response(JSON.stringify([
          { id: 1, name: 'Integradora Sul', documentNumber: '11222333000144' },
          { id: 2, name: 'Integradora Norte', documentNumber: '99888777000100' },
        ]));
      }
      return new Response(JSON.stringify([]));
    });
    vi.stubGlobal('fetch', fetcher);

    render(
      <AdminEnterpriseProvider>
        <SeletorEmpresaAdm />
      </AdminEnterpriseProvider>,
    );

    const select = await screen.findByLabelText(/Selecionar integradora ou visão global/i);
    expect(select).toBeTruthy();
    expect(await screen.findByText('Integradora Sul')).toBeTruthy();

    fireEvent.change(select, { target: { value: '2' } });
    expect((select as HTMLSelectElement).value).toBe('2');
  });

  it('DashboardPage exposes AI metrics and simulation tabs to admins', async () => {
    const kpi = { formatted: 'R$ 100', value: 100 };
    const fetcher = vi.fn().mockImplementation(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('corporate/kpis')) return new Response(JSON.stringify({ spend_current_year: kpi, spend_previous_year: kpi, avg_cost_per_bird: kpi, total_lots: kpi }));
      if (url.includes('corporate/filters')) return new Response(JSON.stringify({ states: ['SP'], months: ['2026-01'], managements: ['Norte'] }));
      if (url.includes('corporate/farms')) return new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 10 }));
      if (url.includes('/v1/admin/ai-metrics/kpis')) {
        return new Response(JSON.stringify({
          token_spend: { value: 1, formatted: 'US$ 1,00', unit: 'US$', year: null, period: '2026-11' },
          total_tokens: { value: 100, formatted: '100', unit: 'tokens', year: null, period: '2026-11' },
          unit_cost: { value: 10, formatted: 'US$ 10,00', unit: 'US$/1k tokens', year: null, period: '2026-11' },
          active_users: { value: 10, formatted: '10', unit: 'usuários', year: 2026, period: null },
        }));
      }
      if (url.includes('/charts/')) {
        const chartId = url.split('/charts/')[1]?.split('/data')[0] ?? 'unknown';
        return new Response(JSON.stringify({
          dashboard_id: 'prometheus-ai',
          chart: { id: chartId, title: chartId, type: 'bar' },
          items: [{ label: 'success', value: 1 }],
        }));
      }
      if (url.includes('/kpis')) return new Response(JSON.stringify({ tokenSpend: { formattedValue: 'R$ 1M' } }));
      if (url.includes('/sessions')) return new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 10 }));
      return new Response(JSON.stringify([]));
    });
    vi.stubGlobal('fetch', fetcher);

    render(
      <MemoryRouter>
        <AdminEnterpriseProvider>
          <DashboardPage />
        </AdminEnterpriseProvider>
      </MemoryRouter>,
    );

    const abaIa = await screen.findByRole('tab', { name: /Gerenciamento de IA/i });
    fireEvent.click(abaIa);
    expect(screen.getByRole('tab', { name: /Gerenciamento de IA/i, selected: true })).toBeTruthy();
    const abaSimulacao = screen.getByRole('tab', { name: /Simulação de IA/i });
    fireEvent.click(abaSimulacao);
    expect(screen.getByRole('tab', { name: /Simulação de IA/i, selected: true })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Cenário de usuários' })).toBeTruthy();
  });

  it('isFarmOwner identifica corretamente produtores e PrivateRoute bloqueia acesso', () => {
    expect(isFarmOwner({ role: 'farm_owner' })).toBe(true);
    expect(isFarmOwner({ accountType: 'farm_owner' })).toBe(true);
    expect(isFarmOwner({ role: 'admin' })).toBe(false);
    expect(isFarmOwner(null)).toBe(false);

    activeAuthUser = { id: '2', name: 'Produtor João', email: 'joao@fazenda.com', role: 'farm_owner', accountType: 'farm_owner' };

    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route
            path="/privado"
            element={
              <PrivateRoute>
                <div>Conteúdo Protegido</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Tela de Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Conteúdo Protegido')).toBeNull();
    expect(mockLogout).toHaveBeenCalled();
  });
});
