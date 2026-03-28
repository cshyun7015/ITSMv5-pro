import React, { createContext, useContext, useState, useEffect } from 'react';
import apiAuth, { type AuthUser } from '../../api/apiAuth';

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        // Validate with backend in a real app: await apiAuth.me();
      } catch (err) {
        localStorage.removeItem('authUser');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (data: any) => {
    const authUser = await apiAuth.login(data);
    setUser(authUser);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    localStorage.setItem('companyId', authUser.companyId);
    localStorage.setItem('userId', authUser.userId);
  };

  const signup = async (data: any) => {
    const authUser = await apiAuth.signup(data);
    setUser(authUser);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    localStorage.setItem('companyId', authUser.companyId);
    localStorage.setItem('userId', authUser.userId);
  };

  const logout = async () => {
    try {
      await apiAuth.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('authUser');
      localStorage.removeItem('companyId');
      localStorage.removeItem('userId');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
