import { Suspense } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { salvarArmazenado } from '@/utils/storage';
import { CHAVE_SESSAO } from '@/utils/chaves';
import { AppRoutes } from '@/routes';
vi.mock('@/pages/Login', () => ({ default: () => <h1>Login de teste</h1> }));
vi.mock('@/pages/Registros', () => ({ default: () => <h1>Registros de teste</h1> }));
vi.mock('@/pages/RegistroDetalhe', () => ({ default: () => <h1>Detalhe de teste</h1> }));
vi.mock('@/pages/Dashboard', () => ({ default: () => <h1>Dashboard de teste</h1> }));
vi.mock('@/pages/Metas', () => ({ default: () => <h1>Metas de teste</h1> }));
vi.mock('@/pages/Ranking', () => ({ default: () => <h1>Ranking de teste</h1> }));
vi.mock('@/pages/Tarefas', () => ({ default: () => <h1>Tarefas de teste</h1> }));
vi.mock('@/pages/Simulacao', () => ({ default: () => <h1>Simulação de teste</h1> }));
vi.mock('@/pages/Perfil', () => ({ default: () => <h1>Perfil de teste</h1> }));
vi.mock('@/pages/NotFound', () => ({ default: () => <h1>Não encontrado de teste</h1> }));
afterEach(() => { cleanup(); localStorage.clear(); });
for (const [path, title] of [['/registros','Registros'],['/registros/1','Detalhe'],['/dashboards','Dashboard'],['/metas','Metas'],['/ranking','Ranking'],['/tarefas','Tarefas'],['/simulacao','Simulação'],['/perfil','Perfil'],['/desconhecido','Não encontrado'],['/','Registros']]) {
 it(`rota ${path} resolve o destino autenticado`, async () => {
  salvarArmazenado(CHAVE_SESSAO, { id: '1', name: 'Ana' });
  render(<MemoryRouter initialEntries={[path]}><AuthProvider><Suspense fallback="Carregando"><AppRoutes /></Suspense></AuthProvider></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: `${title} de teste` })).toBeTruthy();
 });
}
it('rota privada redireciona visitante para login', async () => {
 localStorage.clear();
 render(<MemoryRouter initialEntries={['/registros']}><AuthProvider><Suspense fallback="Carregando"><AppRoutes /></Suspense></AuthProvider></MemoryRouter>);
 expect(await screen.findByRole('heading', { name: 'Login de teste' })).toBeTruthy();
});
