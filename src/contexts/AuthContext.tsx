import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'freelancer' | 'admin';
  avatar?: string;
  skills?: string[];
  company?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (userType: 'client' | 'freelancer' | 'admin') => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  token: string | null;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  userType: 'client' | 'freelancer' | 'admin';
  company?: string;
  skills?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data.user);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Login successful!');
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Login failed'
        : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const loginDemo = async (userType: 'client' | 'freelancer' | 'admin') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/demo-login`, {
        userType,
      });

      const { token: newToken, user: userData } = response.data;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response from server - missing token or user data');
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success(`Demo ${userType} login successful!`);
    } catch (error: unknown) {
      console.error('Demo login error:', error);
      const message = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Demo login failed'
        : 'Demo login failed';
      console.error('Error message:', message);
      toast.error(message);
      throw error;
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Account created successfully!');
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Signup failed'
        : 'Signup failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    loginDemo,
    signup,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};