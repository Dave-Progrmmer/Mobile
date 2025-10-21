// contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { usersAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory storage (replace with AsyncStorage in production)
let storedToken: string | null = null;
let storedUser: User | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(storedUser);
  const [token, setToken] = useState<string | null>(storedToken);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await usersAPI.login(email, password);
      const { token: newToken, user: newUser } = response;
      
      storedToken = newToken;
      storedUser = newUser;
      setToken(newToken);
      setUser(newUser);
      global.authToken = newToken;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await usersAPI.register({ name, email, password, phone });
      const { token: newToken, user: newUser } = response;
      
      storedToken = newToken;
      storedUser = newUser;
      setToken(newToken);
      setUser(newUser);
      global.authToken = newToken;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    storedToken = null;
    storedUser = null;
    setToken(null);
    setUser(null);
    global.authToken = null;
  };

  const updateUser = (updatedUser: User) => {
    storedUser = updatedUser;
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}