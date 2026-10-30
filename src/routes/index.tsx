import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from './PrivateRoute';

const LoginPage = lazy(() => import('@/pages/Login'));
const RegistrosPage = lazy(() => import('@/pages/Registros'));
const RegistroDetalhePage = lazy(() => import('@/pages/RegistroDetalhe'));
const MetasPage = lazy(() => import('@/pages/Metas'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const SimulacaoPage = lazy(() => import('@/pages/Simulacao'));
const PerfilPage = lazy(() => import('@/pages/Perfil'));
const RankingPage = lazy(() => import('@/pages/Ranking'));
const MetasPage = lazy(() => import('@/pages/Metas'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

function RootRoute() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/registros' : '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/registros"
        element={
          <PrivateRoute>
            <RegistrosPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/registros/:id"
        element={
          <PrivateRoute>
            <RegistroDetalhePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboards"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="/metas" element={<PrivateRoute><MetasPage /></PrivateRoute>} />
      <Route
        path="/ranking"
        element={
          <PrivateRoute>
            <RankingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/metas"
        element={
          <PrivateRoute>
            <MetasPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tarefas"
        element={<Navigate to="/metas" replace />}
      />
      <Route
        path="/simulacao"
        element={
          <PrivateRoute>
            <SimulacaoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <PerfilPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
