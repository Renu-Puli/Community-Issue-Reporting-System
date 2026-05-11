import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiPost } from '@/lib/api';

type AppRole = 'user' | 'worker' | 'admin';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  profession?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: AppRole | null;
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: AppRole,
    language: string,
    profession?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: AppRole,
    _language: string,
    profession?: string
  ) => {
    try {
      await apiPost('/auth/register', { email, password, name, role, profession });
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiPost<{ token: string; user: UserProfile }>(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Login failed' } };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const role = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile: user,
        token,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
