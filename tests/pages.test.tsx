import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AdminEnterpriseProvider } from '@/context/AdminEnterpriseContext';
import { salvarArmazenado } from '@/utils/storage';
import { CHAVE_SESSAO } from '@/utils/chaves';
import Registros from '@/pages/Registros';
import Simulacao from '@/pages/Simulacao';
import Ranking from '@/pages/Ranking';
import Perfil from '@/pages/Perfil';
import Metas from '@/pages/Metas';
import Dashboard from '@/pages/Dashboard';
vi.mock('@/utils/delay', () => ({ wait: async () => {}, isAbortError: (e: Error) => e?.name === 'AbortError' }));
const kpi = { formatted: 'R$ 100', value: 100 };
const notification = { id: 1, title: 'Aviso de teste', message: 'Consumo elevado', type: 'info', is_read: false, created_at: '2026-01-01T10:00:00' };
function payload(url: string): unknown {
 if (url.includes('/paged')) { const content = payload(url.replace('/paged', '')); return { content, totalElements: 1, totalPages: 1, page: 0, size: 10, rankingTotalElements: 1, summary: { percentual: 0, concluidas: 0, total: 1 } }; }
 if(url.includes('unread-count')) return { unread_count: 1 };
 if(url.includes('/notifications/')) return { ...notification, is_read: true };
 if(url.includes('/notifications')) return { content: [notification] };
 if(url.includes('production-summaries')) return [{ id: 1, id_lote: 'L1', data_emissao: '2026-01-01', entraram: 20, sairam: 1, custo: 10 }];
 if(url.includes('/simulations')) return [{ id: 1, id_farm: 1, id_lot: 'L1', current_cgi: 2, target_cgi: 1, water_price: 3, energy_price: 4, poultry_quantity: 100, target_energy_kwh: 2 }];
 if(url.includes('/rankings')) return [{ farm_id: 1, farm_name: 'Granja Teste', rank_position: 1, score: 8 }];
 if(url.includes('/podium')) return { ranking_podium: [] };
 if(url.includes('company-employees')) return { id: 1, name: 'Ana Silva', email: 'ana@x.com', telephone: '11999999999', document_number: '12345678900', photo_url: null };
 if(url.includes('state-goals') || url.includes('individual-goals')) return [{ id: 1, title: 'Meta teste', description: 'Consumo', type: 'water', status: 'active', target_value: 10, total_farms: 10, completed_farms: 0, region: 'SP' }];
 if(url.includes('corporate/kpis')) return { spend_current_year: kpi, spend_previous_year: kpi, avg_cost_per_bird: kpi, total_lots: kpi };
 if(url.includes('corporate/filters')) return { states: ['SP'], months: ['2026-01'], managements: ['Norte'] };
 if(url.includes('corporate/farms')) return { items: [], total: 0, page: 1, limit: 10 };
 if(url.includes('/charts/')) return [];
 if(url.includes('/farms')) return [{ id: 1, name: 'Granja Teste', region: 'SP', id_enterprise: 1 }];
 return [];
}
beforeEach(() => {
 localStorage.clear(); salvarArmazenado(CHAVE_SESSAO, { id: '1', name: 'Ana Silva', email: 'ana@x.com', role: 'company_employee' });
 vi.stubGlobal('fetch', vi.fn(async (input) => new Response(JSON.stringify(payload(String(input))), { status: 200 })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
for (const [Page, heading] of [[Registros, /Registros/], [Simulacao, /Simula/], [Ranking, /^Ranking$/], [Perfil, /Perfil -/], [Metas, /^Metas$/], [Dashboard, /Dashboard/i]] as const) {
 it(`página ${heading} carrega dentro da sessão e abre notificações`, async () => {
  const view = render(<MemoryRouter><AuthProvider><AdminEnterpriseProvider><Page /></AdminEnterpriseProvider></AuthProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy();
  if (Page === Perfil) { await waitFor(() => expect(view.container.querySelector('form')).toBeTruthy()); expect(screen.getByDisplayValue('Ana Silva')).toBeTruthy(); return; }
  await waitFor(() => expect(screen.getByRole('button', { name: /Notificações/ }).textContent).toContain('1'));
  fireEvent.click(screen.getByRole('button', { name: /Notificações/ }));
  expect(await screen.findByText('Aviso de teste')).toBeTruthy();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByText('Aviso de teste')).toBeNull();
  expect(view.container.querySelector('main')).toBeTruthy();
 });
}
