// Database Types for Gate Pass System (MSSQL Backend)

export type UserRole = 'STAFF' | 'HOD' | 'CEO' | 'SECURITY' | 'ADMIN';
export type GatePassStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_OUT' | 'RETURNED';

export interface Department {
  id: string;
  name: string;
  head_user_id?: string;
  parent_department_id?: string;
  created_at: string;
  head_name?: string;
}

export interface User {
  id: string;
  name: string;
  payroll_no: string;
  email: string | null;
  role: UserRole;
  department_id: string | null;
  reports_to_user_id: string | null;
  is_temp_password?: boolean;
  must_change_password?: boolean;
  created_at: string;
  updated_at: string;
  department_name?: string;
  reports_to_name?: string;
}

export interface GatePass {
  id: string;
  user_id: string;
  hod_id: string | null;
  reason: string;
  destination: string;
  expected_return: string;
  request_time: string;
  approval_time: string | null;
  rejection_time: string | null;
  out_time: string | null;
  in_time: string | null;
  total_duration_minutes: number | null;
  status: GatePassStatus;
  created_at: string;
  user?: User;
  hod?: User;
  approver?: { name: string; role: string };
}

export interface AuthResponse {
  token: string;
  user: User;
  requiresPasswordChange?: boolean;
}

export interface PasswordChangeRequest {
  payroll_no: string;
  current_password: string;
  new_password: string;
}

export interface CreateUserRequest {
  name: string;
  payroll_no: string;
  email?: string;
  role: UserRole;
  department_id: string;
  reports_to_user_id?: string;
  temporary_password?: string;
}

export interface CreateUserResponse {
  user: User;
  temporary_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  temporary_password: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
