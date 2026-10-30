import type { User } from '@/types/user.types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

export type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'RESTORE_SUCCESS'; payload: User }
  | { type: 'RESTORE_FAILURE' }
  | { type: 'UPDATE_USER'; playload: Partial<User> }
  | { type: 'LOGOUT' };

export const authInitialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true, isInitializing: false };
    case 'RESTORE_SUCCESS':
      return { user: action.payload, isAuthenticated: true, isInitializing: false };
    case 'RESTORE_FAILURE':
      return { user: null, isAuthenticated: false, isInitializing: false };
    case 'UPDATE_USER':
      return state.user ? {...state, user: {...state.user, ...action.playload}}: state;  
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isInitializing: false };
    default:
      return state;
  }
}
