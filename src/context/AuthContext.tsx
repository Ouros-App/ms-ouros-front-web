import { createContext, useReducer } from 'react';
import type { PropsWithChildren } from 'react';
import { authInitialState, authReducer } from '@/reducers/authReducer';
import type { AuthState } from '@/reducers/authReducer';
import type { User } from '@/types/user.types';
import { lerArmazenado, removerArmazenado, salvarArmazenado } from '@/utils/storage';

interface AuthValue {
  user: User | null;
  isAuthenticated: boolean
  login: (user: User) => void;
  logout: () => void;
}
const CHAVE_SESSAO = 'ouros:sessao';

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

  const login = (user: User) =>{
    salvarArmazenado(CHAVE_SESSAO, user);
    dispatch({type: 'LOGIN', payload: user});
  } 

  const logout = () =>{
    removerArmazenado(CHAVE_SESSAO);
    dispatch({type: 'LOGOUT'});
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
