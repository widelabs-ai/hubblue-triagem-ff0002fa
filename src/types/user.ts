
export type UserRole = 'enfermeiro' | 'administrativo' | 'medico' | 'administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
}

export interface AuthUser extends User {
  password?: string;
}
