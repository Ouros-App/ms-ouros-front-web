import { cloneElement } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { CostByRegionChart } from '@/components/complex/GraficosDashboard/charts/CostByRegionChart';
import { BrazilChoroplethMapChart } from '@/components/complex/GraficosDashboard/charts/BrazilChoroplethMapChart';
import { CostByCohortChart } from '@/components/complex/GraficosDashboard/charts/CostByCohortChart';
import { MonthlyCostChart } from '@/components/complex/GraficosDashboard/charts/MonthlyCostChart';
import { CostDistributionDonutChart } from '@/components/complex/GraficosDashboard/charts/CostDistributionDonutChart';
vi.mock('recharts', async () => { const actual = await vi.importActual('recharts'); return { ...actual, ResponsiveContainer: ({ children }: { children: React.ReactElement }) => cloneElement(children, { width: 600, height: 300 } as never) }; });
afterEach(cleanup);
const stats = { min: 10, q1: 20, median: 30, q3: 40, max: 50, lots_count: 5 };
const regions = ['Sul', 'Sudeste', 'Norte', 'Nordeste', 'Centro-Oeste'].map((region, i) => ({ region, previous_year: stats, current_year: { ...stats, max: 100+i }, previous_year_cost: 40, current_year_cost: 80 }));
const buckets = [{ bucket: 'baixo', label: 'Norte', total_cost: 100, value: 100, count: 5, percentage: 100, regions: ['Norte'] }];
for (const [name, Component, props] of [
 ['regiões', CostByRegionChart, { dados: regions }],
 ['coortes', CostByCohortChart, { dados: [{ cohort: 'Pequenos', label: 'Pequenos', previous_year_cost: 100, current_year_cost: 200, cost: 200 }] }],
 ['mensal', MonthlyCostChart, { dados: [{ month: 1, month_label: 'Jan', previous_year_cost: 100, current_year_cost: 200 }] }],
 ['mapa', BrazilChoroplethMapChart, { dados: buckets, dadosRegioesApi: regions }],
 ['distribuição', CostDistributionDonutChart, { dados: buckets }],
] as const) {
 it(`gráfico ${name} apresenta dados e responde à inspeção visual`, () => {
  const view = render(<Component {...props as never} />);
  expect(view.container.querySelector('svg')).toBeTruthy();
  for (const element of view.container.querySelectorAll('svg path, svg rect, svg circle, [tabindex]')) {
   fireEvent.mouseEnter(element, { clientX: 40, clientY: 50 });
   fireEvent.mouseMove(element, { clientX: 45, clientY: 55 });
   fireEvent.focus(element);
   fireEvent.mouseLeave(element);
  }
  expect(view.container.textContent?.length).toBeGreaterThan(0);
 });
 it(`gráfico ${name} aceita conjunto vazio`, () => {
  const view = render(<Component dados={[]} />);
  expect(view.container.textContent).toMatch(/Sem|dados|Custo|Norte|R\$|Total/i);
 });
}
it('regiões aceitam custos sem estatísticas detalhadas', () => {
 const view = render(<CostByRegionChart dados={[{ region: 'Outra', cost: 500 }, { region: 'Sul', cost: 100 }]} />);
 expect(view.container.textContent).toContain('Sul');
});
