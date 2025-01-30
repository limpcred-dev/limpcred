import React, { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AuthProvider as AuthProviderImpl } from '../providers/AuthProvider';

export interface AuthUser extends User {
  tipo: 'admin' | 'user';
  empresaId?: string; // Presente apenas para usuários comuns
}

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthProviderImpl>{children}</AuthProviderImpl>;
};