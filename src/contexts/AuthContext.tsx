import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData, OTPVerification } from '@/types';
import { apiService } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithOTP: (otpData: OTPVerification) => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => void;
  updateUser: (user: User) => void;
  sendOTP: (phone: string) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false, token: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        // Normalize role to lowercase for consistent comparison
        const normalizedUser = {
          ...user,
          role: user.role?.toLowerCase()
        };
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_USER', payload: normalizedUser });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.login(credentials);
      
      // Handle account verification required error
      if (response.code === 'ACCOUNT_NOT_VERIFIED') {
        // Redirect to verification page with email
        window.location.href = `/verification-required?email=${encodeURIComponent(credentials.email || '')}`;
        return;
      }
      
      // Normalize role to lowercase for consistent comparison
      const userData = {
        ...response.data.user,
        role: response.data.user.role?.toLowerCase()
      };
      
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      dispatch({ type: 'SET_TOKEN', payload: response.data.token });
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const loginWithOTP = async (otpData: OTPVerification) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.loginWithOTP(otpData);
      
      // Normalize role to lowercase for consistent comparison
      const userData = {
        ...response.data.user,
        role: response.data.user.role?.toLowerCase()
      };
      
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      dispatch({ type: 'SET_TOKEN', payload: response.data.token });
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.register(data);
      
      // Only set user data if registration was successful and user is verified AND token is provided
      if (response.data.user.isVerified && response.data.token) {
        // Normalize role to lowercase for consistent comparison
        const userData = {
          ...response.data.user,
          role: response.data.user.role?.toLowerCase()
        };
        
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        dispatch({ type: 'SET_TOKEN', payload: response.data.token });
        dispatch({ type: 'SET_USER', payload: userData });
      }
      
      // Always reset loading state after registration
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      const response = await apiService.sendOTP(phone);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.verifyEmail(token);
      
      // Normalize role to lowercase for consistent comparison
      const userData = {
        ...response.data.user,
        role: response.data.user.role?.toLowerCase()
      };
      
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      dispatch({ type: 'SET_TOKEN', payload: response.data.token });
      dispatch({ type: 'SET_USER', payload: userData });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user_data', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    loginWithOTP,
    register,
    logout,
    updateUser,
    sendOTP,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
