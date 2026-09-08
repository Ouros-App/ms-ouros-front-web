import { apiClient } from './apiClient';
import type { User } from '@/types/user.types';

export const userService = {
  getProfile: () => apiClient<User>('/users/me'),
  login: (email: string, password: string) =>
    apiClient<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};
