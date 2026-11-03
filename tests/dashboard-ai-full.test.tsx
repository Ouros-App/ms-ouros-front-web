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
    expect(screen.getByRole('heading', { name: /Chat por resultado/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Uso de agentes/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Uso de tools/ })).toBeTruthy();
    expect(await screen.findByText('1.250')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Tokens no mês' })).toBeTruthy();
    expect(fetcher).toHaveBeenCalledTimes(6);
    fireEvent.change(screen.getByLabelText('Mês dos KPIs'), { target: { value: '2024-02' } });
    await waitFor(() => {
      expect(fetcher.mock.calls.some(([url]) => String(url).includes('month=2024-02'))).toBe(true);
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

  it('DashboardPage alterna entre as abas Operacional e Gerenciamento de IA para admin', async () => {
    const kpi = { formatted: 'R$ 100', value: 100 };
    const fetcher = vi.fn().mockImplementation(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('corporate/kpis')) return new Response(JSON.stringify({ spend_current_year: kpi, spend_previous_year: kpi, avg_cost_per_bird: kpi, total_lots: kpi }));
      if (url.includes('corporate/filters')) return new Response(JSON.stringify({ states: ['SP'], months: ['2026-01'], managements: ['Norte'] }));
      if (url.includes('corporate/farms')) return new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 10 }));
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

    // Deve conter as abas
    const abaIa = await screen.findByRole('tab', { name: /Gerenciamento de IA/i });
    expect(abaIa).toBeTruthy();

    fireEvent.click(abaIa);
    expect(screen.getByRole('tab', { name: /Gerenciamento de IA/i, selected: true })).toBeTruthy();
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
