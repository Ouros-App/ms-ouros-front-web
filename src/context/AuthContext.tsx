import { createContext, useCallback, useEffect, useReducer, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { authInitialState, authReducer } from '@/reducers/authReducer';
import type { AuthState } from '@/reducers/authReducer';
import type { User } from '@/types/user.types';
import { CHAVE_SESSAO } from '@/utils/chaves';
import { lerArmazenado, removerArmazenado, salvarArmazenado } from '@/utils/storage';
import { encerrarSessaoWeb } from '@/services/authService';
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
  isInitializing: boolean;
  login: (user: User) => void;
  updateUser: (dados: Partial<User>) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthValue | null>(null);

function persistirUsuario(user: User): User {
  const perfil = { ...user };
  delete perfil.token;
  delete perfil.refreshToken;
  salvarArmazenado(CHAVE_SESSAO, perfil);
  return perfil;
}

function restaurarSessao(): AuthState {
  const user = lerArmazenado<User>(CHAVE_SESSAO);
  if (user && typeof user.id === 'string' && typeof user.name === 'string') {
    return { user: persistirUsuario(user), isAuthenticated: false, isInitializing: true };
  }
  return authInitialState;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, authInitialState, restaurarSessao);
  const restoreStarted = useRef(false);

  const login = (user: User) => {
    limparTokens();
    const usuarioPersistido = persistirUsuario(user);
    if (user.token) {
      salvarTokens({
        accessToken: user.token,
        refreshToken: user.refreshToken,
      });
    }
    dispatch({ type: 'LOGIN', payload: usuarioPersistido });
  };

  const updateUser = useCallback(
    (dados: Partial<User>) => {
      if (state.user) {
        const atualizado = { ...state.user, ...dados };
        if (dados.token) {
          salvarTokens({
            accessToken: dados.token,
            refreshToken: dados.refreshToken,
          });
        }
        const usuarioPersistido = persistirUsuario(atualizado);
        dispatch({ type: 'UPDATE_USER', playload: usuarioPersistido });
        return;
      }
      const perfil = { ...dados };
      delete perfil.token;
      delete perfil.refreshToken;
      dispatch({ type: 'UPDATE_USER', playload: perfil });
    },
    [state.user],
  );

  const logout = useCallback(() => {
    removerArmazenado(CHAVE_SESSAO);
    limparTokens();
    dispatch({ type: 'LOGOUT' });
    void encerrarSessaoWeb().catch((error: unknown) => {
      console.warn('Não foi possível encerrar a sessão remota:', error);
    });
  }, []);

  useEffect(() => {
    if (!state.isInitializing || !state.user || restoreStarted.current) return;
    restoreStarted.current = true;
    const cachedUser = state.user;

    void executarRenovacaoToken()
      .then((token) => {
        if (token) {
          dispatch({ type: 'RESTORE_SUCCESS', payload: cachedUser });
        } else {
          dispatch({ type: 'RESTORE_FAILURE' });
        }
      })
      .catch((error: unknown) => {
        console.warn('Não foi possível restaurar a sessão:', error);
        dispatch({ type: 'RESTORE_FAILURE' });
      });
  }, [state.isInitializing, state.user]);

  // Sincronização de eventos globais de renovação e expiração de sessão
  useEffect(() => {
    const handleTokenRefreshed = (
      event: CustomEvent<{ accessToken: string }>,
    ) => {
      updateUser({ token: event.detail.accessToken });
    };

    const handleSessionExpired = () => {
      logout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated) {
        const token = obterAccessToken();
        if (token && isTokenExpirado(token, 60)) {
          void executarRenovacaoToken().catch((error: unknown) => {
            console.warn('Não foi possível renovar a sessão:', error);
          });
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
