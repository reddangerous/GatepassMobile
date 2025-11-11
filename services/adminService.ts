import apiService from '@/lib/api';
import { User, Department, CreateUserRequest, CreateUserResponse, ResetPasswordResponse } from '@/lib/types';

export const adminService = {
  // User Management
  async getAllUsers() {
    try {
      const data = await apiService.get<User[]>('/auth/users');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async createUser(userData: CreateUserRequest) {
    try {
      const data = await apiService.post<CreateUserResponse>('/auth/users', userData);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async updateUser(userId: string, userData: Partial<CreateUserRequest>) {
    try {
      const data = await apiService.put<User>(`/auth/users/${userId}`, userData);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async resetUserPassword(userId: string, temporaryPassword?: string) {
    try {
      const data = await apiService.post<ResetPasswordResponse>(`/auth/users/${userId}/reset-password`, {
        temporary_password: temporaryPassword
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Department Management
  async getAllDepartments() {
    try {
      const data = await apiService.get<Department[]>('/auth/departments');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Get users who can be supervisors (HOD, CTO, ADMIN)
  async getPotentialSupervisors() {
    try {
      const { data: users, error } = await this.getAllUsers();
      if (error || !users) return { data: null, error };
      
      const supervisors = users.filter(user => 
        ['HOD', 'CTO', 'ADMIN'].includes(user.role)
      );
      return { data: supervisors, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
};