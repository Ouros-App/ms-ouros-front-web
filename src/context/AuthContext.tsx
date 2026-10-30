import { createContext, useCallback, useEffect, useReducer } from 'react';
import type { PropsWithChildren } from 'react';
import { authInitialState, authReducer } from '@/reducers/authReducer';
import type { AuthState } from '@/reducers/authReducer';
import type { User } from '@/types/user.types';
import { CHAVE_SESSAO } from '@/utils/chaves';
import { lerArmazenado, removerArmazenado, salvarArmazenado } from '@/utils/storage';
import {
  executarRenovacaoToken,
  isTokenExpirado,
  limparTokens,
  obterAccessToken,
  salvarTokens,
} from '@/services/tokenService';

interface AuthValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  updateUser: (dados: Partial<User>) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthValue | null>(null);

function restaurarSessao(): AuthState {
  const user = lerArmazenado<User>(CHAVE_SESSAO);
  if (user && typeof user.id === 'string' && typeof user.name === 'string') {
    return { user, isAuthenticated: true };
  }
  return authInitialState;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, authInitialState, restaurarSessao);

  const login = (user: User) => {
    salvarArmazenado(CHAVE_SESSAO, user);
    if (user.token) {
      salvarTokens({
        accessToken: user.token,
        refreshToken: user.refreshToken,
      });
    }
    dispatch({ type: 'LOGIN', payload: user });
  };

  const updateUser = useCallback(
    (dados: Partial<User>) => {
      if (state.user) {
        const atualizado = { ...state.user, ...dados };
        salvarArmazenado(CHAVE_SESSAO, atualizado);
        if (dados.token) {
          salvarTokens({
            accessToken: dados.token,
            refreshToken: dados.refreshToken || state.user.refreshToken,
          });
        }
      }
      dispatch({ type: 'UPDATE_USER', playload: dados });
    },
    [state.user],
  );

  const logout = useCallback(() => {
    removerArmazenado(CHAVE_SESSAO);
    limparTokens();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Sincronização de eventos globais de renovação e expiração de sessão
  useEffect(() => {
    const handleTokenRefreshed = (
      event: CustomEvent<{ accessToken: string; refreshToken?: string }>,
    ) => {
      const { accessToken, refreshToken } = event.detail;
      updateUser({ token: accessToken, refreshToken });
    };

    const handleSessionExpired = () => {
      logout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated) {
        const token = obterAccessToken();
        if (token && isTokenExpirado(token, 60)) {
          void executarRenovacaoToken();
        }
      }
    };

    window.addEventListener('auth:token_refreshed', handleTokenRefreshed as EventListener);
    window.addEventListener('auth:session_expired', handleSessionExpired);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('auth:token_refreshed', handleTokenRefreshed as EventListener);
      window.removeEventListener('auth:session_expired', handleSessionExpired);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout, state.isAuthenticated, updateUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
