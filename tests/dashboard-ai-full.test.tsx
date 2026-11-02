import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DashboardAiMetrics } from '@/components/complex/DashboardAiMetrics';
import { SeletorEmpresaAdm } from '@/components/complex/SeletorEmpresaAdm';
import { AdminEnterpriseProvider } from '@/context/AdminEnterpriseContext';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { isFarmOwner } from '@/services/tokenService';
import DashboardPage from '@/pages/Dashboard';
import { AiTokenSpendChart } from '@/components/complex/DashboardAiMetrics/charts/AiTokenSpendChart';
import { AiRequestSpendChart } from '@/components/complex/DashboardAiMetrics/charts/AiRequestSpendChart';
import { AiCostByRegionChart } from '@/components/complex/DashboardAiMetrics/charts/AiCostByRegionChart';
import { AiMonthlyCostChart } from '@/components/complex/DashboardAiMetrics/charts/AiMonthlyCostChart';
import {
  FALLBACK_AI_TOKEN_SPEND,
  FALLBACK_AI_REQUEST_SPEND,
  FALLBACK_AI_COST_BY_REGION,
  FALLBACK_AI_MONTHLY_COST,
} from '@/services/adminAiMetricsService';

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

describe('Dashboard IA e Governança ADM - Cobertura Completa', () => {
  it('renderiza os 4 componentes visuais de gráficos com dados de fallback', () => {
    const { container: c1 } = render(<AiTokenSpendChart dados={FALLBACK_AI_TOKEN_SPEND} />);
    expect(c1.querySelector('.dashboard-ai-metrics__chart-wrapper')).toBeTruthy();

    const { container: c2 } = render(<AiRequestSpendChart dados={FALLBACK_AI_REQUEST_SPEND} />);
    expect(c2.querySelector('.dashboard-ai-metrics__chart-wrapper')).toBeTruthy();

    const { container: c3 } = render(<AiCostByRegionChart dados={FALLBACK_AI_COST_BY_REGION} />);
    expect(c3.querySelector('.dashboard-ai-metrics__chart-wrapper')).toBeTruthy();

    const { container: c4 } = render(<AiMonthlyCostChart dados={FALLBACK_AI_MONTHLY_COST} />);
    expect(c4.querySelector('.dashboard-ai-metrics__chart-wrapper')).toBeTruthy();
  });

  it('DashboardAiMetrics renderiza controles, KPI cards, gráficos e permite trocar período', async () => {
    const fetcher = vi.fn().mockImplementation(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/kpis')) {
        return new Response(JSON.stringify({
          tokenSpend: { label: 'Gasto de Tokens- 2025', formattedValue: 'R$ 15.11M', comparisonLabel: 'Total', value: 15110000 },
          unitTokenCost: { label: 'Reais/Token', formattedValue: 'R$ 0.94', comparisonLabel: 'Custo', value: 0.94 },
          activeUsers: { label: 'Usuários', formattedValue: '104.728', comparisonLabel: 'Total', value: 104728 },
        }));
      }
      if (url.includes('/sessions')) {
        return new Response(JSON.stringify({
          total: 1,
          page: 1,
          limit: 10,
          items: [
            {
              session_id: 'midas-sess-test-01',
              user_id: 99,
              user_name: 'Usuário Teste',
              account_type: 'admin',
              enterprise_id: 1,
              farm_id: null,
              model: 'openai/gpt-oss-120b',
              prompt_tokens: 500,
              completion_tokens: 500,
              total_tokens: 1000,
              cost_brl: 0.94,
              latency_ms: 50,
              accuracy_rate: 98,
              status: 'success',
              created_at: '2026-10-28T10:00:00Z',
            },
          ],
        }));
      }
      return new Response(JSON.stringify({ items: [] }));
    });
    vi.stubGlobal('fetch', fetcher);

    render(<DashboardAiMetrics enterpriseId={1} />);

    // Verifica presença dos KPI cards
    expect(await screen.findByText('R$ 15.11M')).toBeTruthy();
    expect(screen.getAllByText('R$ 0.94').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('104.728')).toBeTruthy();

    // Filtro de período
    const select = screen.getByRole('combobox', { name: /Filtrar métricas de IA por período/i });
    fireEvent.change(select, { target: { value: 'ultimo-trimestre' } });
    expect((select as HTMLSelectElement).value).toBe('ultimo-trimestre');

    // Sessão carregada
    expect(await screen.findByText('midas-sess-test-01')).toBeTruthy();
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
