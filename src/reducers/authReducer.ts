import type { User } from '@/types/user.types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type AuthAction = | { type: 'LOGIN'; payload: User } | {type: 'UPDATE_USER'; playload: Partial<User>} | { type: 'LOGOUT' }

export const authInitialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'UPDATE_USER':
      return state.user ? {...state, user: {...state.user, ...action.playload}}: state;  
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
}
