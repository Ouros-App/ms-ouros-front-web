import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isFarmOwner } from '@/services/tokenService';

export function PrivateRoute({ children }: PropsWithChildren) {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <p role="status" aria-live="polite">Restaurando sessão...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isFarmOwner(user)) {
    logout();
    return (
      <Navigate
        to="/login"
        replace
        state={{
          erro: 'Acesso restrito: Produtores (farm_owner) devem acessar exclusivamente pelo aplicativo móvel Ouros.',
        }}
      />
    );
  }

  return children;
}
