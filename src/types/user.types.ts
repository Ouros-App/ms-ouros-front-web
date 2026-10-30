export type UserRole = 'admin' | 'user' | 'farm_owner' | 'company_employee' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  token?: string;
  refreshToken?: string;
  databaseId?: number;
  accountType?: string;
}
