// Database Types for Gate Pass System (MSSQL Backend)

export type UserRole = 'STAFF' | 'HOD' | 'SECURITY' | 'ADMIN';
export type GatePassStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_OUT' | 'RETURNED';

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  payroll_no: string;
  email: string | null;
  role: UserRole;
  department_id: string | null;
  created_at: string;
  updated_at: string;
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
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}
