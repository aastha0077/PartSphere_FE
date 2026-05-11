import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

// ===== TYPES =====
interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  customerId?: number;
  exp: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  register: (data: RegisterData) => Promise<void>;
  logout: (message?: string) => void;
  sessionMessage: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface JwtPayload {
  [key: string]: any;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== HELPER: Decode JWT to AuthUser =====
function decodeToken(token: string): AuthUser | null {
  try {
    const decoded: JwtPayload = jwtDecode(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      userId: parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '0'),
      name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Customer',
      customerId: decoded['CustomerId'] ? parseInt(decoded['CustomerId']) : undefined,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

// ===== PROVIDER =====
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  // --- Logout ---
  const logout = useCallback((message?: string) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (message) {
      setSessionMessage(message);
      // Clear after 5 seconds
      setTimeout(() => setSessionMessage(null), 5000);
    }
  }, []);

  // --- Initialize: Check token on app load ---
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded) {
        setToken(savedToken);
        setUser(decoded);
      } else {
        // Token is expired or invalid
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // --- Auto-logout on token expiry ---
  useEffect(() => {
    if (!user) return;

    const timeUntilExpiry = user.exp * 1000 - Date.now();
    if (timeUntilExpiry <= 0) {
      logout('Your session has expired. Please log in again.');
      return;
    }

    const timer = setTimeout(() => {
      logout('Your session has expired. Please log in again.');
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [user, logout]);

  // --- Login ---
  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken } = response.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);

    const decoded = decodeToken(newToken);
    if (!decoded) {
      throw new Error('Invalid token received from server.');
    }

    setUser(decoded);
    setSessionMessage(null);

    return { role: decoded.role };
  };

  // --- Register (CUSTOMER ONLY) ---
  const register = async (data: RegisterData) => {
    await api.post('/auth/register', data);
    // Don't auto-login — redirect to login page
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        sessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===== HOOK =====
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
