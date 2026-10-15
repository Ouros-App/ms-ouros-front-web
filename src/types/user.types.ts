export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatarUrl?: string,
  token?: string;
}
