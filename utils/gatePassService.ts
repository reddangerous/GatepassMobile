import apiService from '@/lib/api';
import { GatePass } from '@/lib/types';

export const gatePassService = {
  async createGatePass(data: {
    reason: string;
    destination: string;
    estimated_return_time: string;
  }) {
    try {
      const response = await apiService.post('/gate-passes', {
        reason: data.reason,
        destination: data.destination,
        estimated_return_time: data.estimated_return_time,
      });
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Error creating gate pass:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create gate pass' 
      };
    }
  },

  async createRequest(data: {
    userId: string;
    reason: string;
    destination: string;
    expectedReturn: Date;
  }) {
    try {
      const gatePass = await apiService.post<GatePass>('/gate-passes', {
        user_id: data.userId,
        reason: data.reason,
        destination: data.destination,
        expected_return: data.expectedReturn.toISOString(),
      });
      return { data: gatePass, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getMyPasses(userId: string) {
    try {
      const data = await apiService.get<GatePass[]>(`/gate-passes/user/${userId}`);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getPendingApprovals(approverUserId: string) {
    try {
      const data = await apiService.get<GatePass[]>(`/gate-passes/pending/${approverUserId}`);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async approvePass(passId: string, approverUserId: string, approvalData?: any) {
    try {
      const requestData = {
        hod_id: approverUserId, // Backend still uses hod_id for approver
        ...approvalData // This can include adjusted_duration_minutes
      };
      
      const data = await apiService.post<GatePass>(`/gate-passes/${passId}/approve`, requestData);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async rejectPass(passId: string, approverUserId: string) {
    try {
      const data = await apiService.post<GatePass>(`/gate-passes/${passId}/reject`, {
        hod_id: approverUserId, // Backend still uses hod_id for approver
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getPassByPayroll(payrollNo: string) {
    try {
      const data = await apiService.get<GatePass | null>(`/gate-passes/payroll/${payrollNo}`);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async checkOut(passId: string) {
    try {
      const data = await apiService.post<GatePass>(`/gate-passes/${passId}/checkout`);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async checkIn(passId: string) {
    try {
      const data = await apiService.post<GatePass>(`/gate-passes/${passId}/checkin`);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getAllPasses() {
    try {
      const data = await apiService.get<GatePass[]>('/gate-passes');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getTodaysPasses() {
    try {
      const data = await apiService.get<GatePass[]>('/gate-passes/today');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getDepartmentPasses(hodUserId: string, filters?: { status?: string; employee_id?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.employee_id) params.append('employee_id', filters.employee_id);
      
      const url = `/gate-passes/department/${hodUserId}${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiService.get<GatePass[]>(url);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getDepartmentEmployees(hodUserId: string) {
    try {
      const data = await apiService.get(`/gate-passes/department/${hodUserId}/employees`);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Pagination-enabled methods
  async getMyPassesPaginated(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status && options.status !== 'ALL') params.append('status', options.status);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      
      const url = `/gate-passes/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiService.get<{
        data: GatePass[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalRecords: number;
          limit: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      }>(url);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getPendingApprovalsPaginated(approverUserId: string, options: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      
      const url = `/gate-passes/pending/${approverUserId}${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiService.get<{
        data: GatePass[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalRecords: number;
          limit: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      }>(url);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getDepartmentPassesPaginated(hodUserId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    employee_id?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status && options.status !== 'ALL') params.append('status', options.status);
      if (options.employee_id && options.employee_id !== 'ALL') params.append('employee_id', options.employee_id);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      
      const url = `/gate-passes/department/${hodUserId}${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiService.get<{
        data: GatePass[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalRecords: number;
          limit: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      }>(url);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
