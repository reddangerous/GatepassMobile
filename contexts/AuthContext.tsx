import React, { createContext, useContext, useEffect, useState } from 'react';
import apiService from '@/lib/api';
import { User, AuthResponse, PasswordChangeRequest } from '@/lib/types';
import * as SecureStore from 'expo-secure-store';
import { notificationService } from '@/services/notificationService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  requiresPasswordChange: boolean;
  tempUser: { id: string; payroll_no: string; name: string } | null;
  signIn: (payrollNo: string, password: string) => Promise<{ error: Error | null; requiresPasswordChange?: boolean }>;
  signOut: () => Promise<void>;
  changePassword: (passwordData: PasswordChangeRequest) => Promise<{ error: Error | null }>;
  isAdmin: () => boolean;
  isApprover: () => boolean;
  isCEO: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [tempUser, setTempUser] = useState<{ id: string; payroll_no: string; name: string } | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        await apiService.setToken(token);
        const userData = await apiService.get<User>('/auth/me');
        setUser(userData);
        
        // Register for push notifications after loading user
        await registerPushNotifications();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await apiService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const registerPushNotifications = async () => {
    try {
      const pushToken = await notificationService.registerForPushNotifications();
      if (pushToken) {
        // Send push token to backend
        await apiService.post('/auth/push-token', { push_token: pushToken });
        console.log('📱 Push token registered successfully');
      }
    } catch (error) {
      console.error('❌ Failed to register push notifications:', error);
      // Don't fail login if push notification registration fails
    }
  };

  const signIn = async (payrollNo: string, password: string) => {
    try {
      console.log('Attempting login with:', { payrollNo, passwordLength: password.length });
      
      const response = await apiService.post<AuthResponse>('/auth/login', {
        payroll_no: payrollNo,
        password,
      });

      console.log('Login response:', response);
      
      // Check if password change is required
      if (response.requiresPasswordChange) {
        setRequiresPasswordChange(true);
        setTempUser({
          id: response.user.id,
          payroll_no: response.user.payroll_no,
          name: response.user.name
        });
        return { error: null, requiresPasswordChange: true };
      }
      
      await apiService.setToken(response.token);
      setUser(response.user);
      setRequiresPasswordChange(false);
      setTempUser(null);
      
      // Register for push notifications after successful login
      await registerPushNotifications();
      
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle password change required case (status 202)
      if (error.response?.status === 202 && error.response?.data?.requiresPasswordChange) {
        setRequiresPasswordChange(true);
        setTempUser(error.response.data.user);
        return { error: null, requiresPasswordChange: true };
      }
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { error: new Error(errorMessage) };
    }
  };

  const changePassword = async (passwordData: PasswordChangeRequest) => {
    try {
      await apiService.post('/auth/change-password', passwordData);
      
      // After successful password change, log them in
      const loginResult = await signIn(passwordData.payroll_no, passwordData.new_password);
      if (!loginResult.error) {
        setRequiresPasswordChange(false);
        setTempUser(null);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'Password change failed';
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await apiService.clearToken();
      setUser(null);
      setRequiresPasswordChange(false);
      setTempUser(null);
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isApprover = () => {
    return user?.role ? ['HOD', 'CEO', 'ADMIN'].includes(user.role) : false;
  };

  const isCEO = () => {
    return user?.role === 'CEO';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      requiresPasswordChange,
      tempUser,
      signIn, 
      signOut, 
      changePassword,
      isAdmin,
      isApprover,
      isCEO
    }}>
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
