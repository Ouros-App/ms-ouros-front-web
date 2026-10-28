import { lazy } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { PrivateRoute } from './PrivateRoute';

const HomePage = lazy(() => import('@/pages/Home'));
const ProductsPage = lazy(() => import('@/pages/Products'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RegistrosPage = lazy(() => import('@/pages/Registros'))
const RegistroDetalhePage = lazy(()=> import('@/pages/RegistroDetalhe'));
const RankingPage = lazy(() => import('@/pages/Ranking'));
const SimulacaoPage = lazy(() => import('@/pages/Simulacao'));
const PerfilPage = lazy(() => import('@/pages/Perfil'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registros" element={<PrivateRoute><RegistrosPage /></PrivateRoute>} />
      <Route path="/registros/:id" element={<PrivateRoute><RegistroDetalhePage /></PrivateRoute>} />
      <Route path="/ranking" element={<PrivateRoute><RankingPage /></PrivateRoute>} />
      <Route path="/simulacao" element={<PrivateRoute><SimulacaoPage /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><PerfilPage /></PrivateRoute>} />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <ProductDetailPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}