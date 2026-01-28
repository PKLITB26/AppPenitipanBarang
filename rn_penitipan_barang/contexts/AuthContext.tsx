import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface User {
  id: number;
  role: string;
  no_telpon: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage helper untuk web dan mobile
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      return AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      return AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      return AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔄 Loading stored auth...');
      const storedToken = await storage.getItem('token');
      const storedUser = await storage.getItem('user');
      
      console.log('🔑 Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
      console.log('👤 Stored user:', storedUser);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('✅ Auth loaded from storage');
      } else {
        console.log('⚠️ No stored auth found');
      }
    } catch (error) {
      console.error('❌ Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authToken: string, userData: User) => {
    try {
      console.log('🔐 Storing auth data...');
      console.log('🔑 Token:', authToken.substring(0, 20) + '...');
      console.log('👤 User data:', userData);
      
      await storage.setItem('token', authToken);
      await storage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      
      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Error storing auth:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      console.log('Platform:', Platform.OS);
      
      // Clear storage first
      await storage.removeItem('token');
      await storage.removeItem('user');
      
      console.log('Storage cleared successfully');
      
      // Clear state
      setToken(null);
      setUser(null);
      
      console.log('State cleared successfully');
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error removing auth:', error);
      // Force clear state even if storage fails
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};