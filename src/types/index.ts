export type Role = 'admin' | 'manager' | 'employee';

export type Company = 'Fam Infomedia' | 'Feathers Groups' | 'Feather Groups';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  department: string;
  designation: string;
  phone: string;
  company: Company;
  salary: number;
  joiningDate: string;
  managerId?: string; // for employees assigned to a manager
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  loginTime?: string;
  logoutTime?: string;
  morningBreakStart?: string;
  morningBreakEnd?: string;
  eveningBreakStart?: string;
  eveningBreakEnd?: string;
  lunchStart?: string;
  lunchEnd?: string;
  isLate: boolean;
  fineAmount: number;
  totalWorkHours: number;
  lunchExceeded: boolean;
  breakExceeded: boolean;
  status: 'present' | 'absent' | 'leave' | 'half-day';
}

export type LeaveType = 'CL' | 'SL' | 'EL' | 'Unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  purpose: string;
  date: string;
  status: LeaveStatus;
  remarks?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface CompanyTimingRules {
  company: Company;
  officeStartTime: string;
  officeEndTime: string;
  morningBreakStart: string;
  morningBreakEnd: string;
  eveningBreakStart: string;
  eveningBreakEnd: string;
  lunchDurationMinutes: number;
  lunchCustomizable: boolean;
  totalWorkHoursPerDay: number; // in minutes
  totalBreakMinutesPerDay: number;
  lateThresholdMinutes: number;
  lateFineAmount: number;
}
