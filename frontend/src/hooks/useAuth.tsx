import { createContext, useContext, useState, useMemo } from 'react';
import { authService } from '../services/authService';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  isOnline?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: { name: string; email: string; password: string }) => Promise<any>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<any>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) as User : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    setToken(response.token);
    setUser(response);
    return response;
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    const response = await authService.updateProfile(userData);
    const updatedUser = { ...user, ...response };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return response;
  };

  const isAuthenticated = useMemo(() => {
    return !!token && !!user;
  }, [token, user]);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};