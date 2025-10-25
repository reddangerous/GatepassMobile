import apiService from '@/lib/api';
import { PasswordChangeRequest } from '@/lib/types';

export const authService = {
  async changePassword(passwordData: PasswordChangeRequest) {
    try {
      const data = await apiService.post('/auth/change-password', passwordData);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async logout() {
    try {
      const data = await apiService.post('/auth/logout');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getCurrentUser() {
    try {
      const data = await apiService.get('/auth/me');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
};