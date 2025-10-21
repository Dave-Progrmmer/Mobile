// contexts/AuthContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { usersAPI } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory storage
let storedToken: string | null = null;
let storedUser: User | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(storedUser);
  const [token, setToken] = useState<string | null>(storedToken);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await usersAPI.login(email, password);
      const { token: newToken, ...userData } = response;
      
      const newUser: User = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      
      storedToken = newToken;
      storedUser = newUser;
      setToken(newToken);
      setUser(newUser);
      global.authToken = newToken;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    try {
      const response = await usersAPI.register({ name, email, password, phoneNumber });
      const { token: newToken, ...userData } = response;
      
      const newUser: User = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phoneNumber,
      };
      
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