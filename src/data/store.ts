import { User, AttendanceRecord, LeaveRequest, CompanyTimingRules, Company, Role } from '@/types';

const USERS_KEY = 'crm_users';
const ATTENDANCE_KEY = 'crm_attendance';
const LEAVES_KEY = 'crm_leaves';

const defaultAdmin: User = {
  id: 'ADMIN-001',
  email: 'admin@crm',
  password: 'admin1234',
  name: 'System Admin',
  role: 'admin',
  department: 'Administration',
  designation: 'Administrator',
  phone: '',
  company: 'Fam Infomedia',
  salary: 0,
  joiningDate: '2024-01-01',
};

const defaultTimingRules: CompanyTimingRules[] = [
  {
    company: 'Feathers Groups',
    officeStartTime: '09:00',
    officeEndTime: '21:00',
    morningBreakStart: '11:00',
    morningBreakEnd: '11:15',
    eveningBreakStart: '16:00',
    eveningBreakEnd: '16:30',
    lunchDurationMinutes: 30,
    lunchCustomizable: true,
    totalWorkHoursPerDay: 675, // 11.25 hrs minus breaks
    totalBreakMinutesPerDay: 75,
    lateThresholdMinutes: 5,
    lateFineAmount: 100,
  },
  {
    company: 'Feather Groups',
    officeStartTime: '09:00',
    officeEndTime: '21:00',
    morningBreakStart: '11:00',
    morningBreakEnd: '11:15',
    eveningBreakStart: '16:00',
    eveningBreakEnd: '16:30',
    lunchDurationMinutes: 30,
    lunchCustomizable: true,
    totalWorkHoursPerDay: 675,
    totalBreakMinutesPerDay: 75,
    lateThresholdMinutes: 5,
    lateFineAmount: 100,
  },
  {
    company: 'Fam Infomedia',
    officeStartTime: '09:00',
    officeEndTime: '18:30',
    morningBreakStart: '11:00',
    morningBreakEnd: '11:15',
    eveningBreakStart: '16:00',
    eveningBreakEnd: '16:15',
    lunchDurationMinutes: 30,
    lunchCustomizable: true,
    totalWorkHoursPerDay: 510, // 8.5 hrs
    totalBreakMinutesPerDay: 60,
    lateThresholdMinutes: 5,
    lateFineAmount: 100,
  },
];

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize
export function initStore() {
  const users = getFromStorage<User[]>(USERS_KEY, []);
  if (!users.find(u => u.email === 'admin@crm')) {
    setToStorage(USERS_KEY, [defaultAdmin, ...users]);
  }
}

// Users
export function getUsers(): User[] {
  return getFromStorage<User[]>(USERS_KEY, [defaultAdmin]);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUsersByRole(role: Role): User[] {
  return getUsers().filter(u => u.role === role);
}

export function getUsersByManager(managerId: string): User[] {
  return getUsers().filter(u => u.managerId === managerId);
}

export function getUsersByCompany(company: Company): User[] {
  return getUsers().filter(u => u.company === company);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  setToStorage(USERS_KEY, users);
}

export function updateUser(id: string, updates: Partial<User>): void {
  const users = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  setToStorage(USERS_KEY, users);
}

export function deleteUser(id: string): void {
  setToStorage(USERS_KEY, getUsers().filter(u => u.id !== id));
}

// Attendance
export function getAttendanceRecords(): AttendanceRecord[] {
  return getFromStorage<AttendanceRecord[]>(ATTENDANCE_KEY, []);
}

export function getAttendanceByUser(userId: string): AttendanceRecord[] {
  return getAttendanceRecords().filter(a => a.userId === userId);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return getAttendanceRecords().filter(a => a.date === date);
}

export function getTodayAttendance(userId: string): AttendanceRecord | undefined {
  const today = new Date().toISOString().split('T')[0];
  return getAttendanceRecords().find(a => a.userId === userId && a.date === today);
}

export function upsertAttendance(record: AttendanceRecord): void {
  const records = getAttendanceRecords();
  const idx = records.findIndex(r => r.id === record.id);
  if (idx >= 0) records[idx] = record;
  else records.push(record);
  setToStorage(ATTENDANCE_KEY, records);
}

// Leaves
export function getLeaveRequests(): LeaveRequest[] {
  return getFromStorage<LeaveRequest[]>(LEAVES_KEY, []);
}

export function getLeavesByUser(userId: string): LeaveRequest[] {
  return getLeaveRequests().filter(l => l.userId === userId);
}

export function getPendingLeaves(): LeaveRequest[] {
  return getLeaveRequests().filter(l => l.status === 'pending');
}

export function getPendingLeavesByManager(managerId: string): LeaveRequest[] {
  const teamIds = getUsersByManager(managerId).map(u => u.id);
  return getLeaveRequests().filter(l => l.status === 'pending' && teamIds.includes(l.userId));
}

export function addLeaveRequest(leave: LeaveRequest): void {
  const leaves = getLeaveRequests();
  leaves.push(leave);
  setToStorage(LEAVES_KEY, leaves);
}

export function updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): void {
  const leaves = getLeaveRequests().map(l => l.id === id ? { ...l, ...updates } : l);
  setToStorage(LEAVES_KEY, leaves);
}

// Timing rules
export function getTimingRules(): CompanyTimingRules[] {
  return defaultTimingRules;
}

export function getTimingRulesByCompany(company: Company): CompanyTimingRules {
  return defaultTimingRules.find(r => r.company === company) || defaultTimingRules[0];
}

// Helpers
export function getMonthlyLateCount(userId: string, month?: string): number {
  const m = month || new Date().toISOString().slice(0, 7);
  return getAttendanceByUser(userId).filter(a => a.date.startsWith(m) && a.isLate).length;
}

export function getMonthlyCLCount(userId: string, month?: string): number {
  const m = month || new Date().toISOString().slice(0, 7);
  return getLeavesByUser(userId).filter(l => l.date.startsWith(m) && l.leaveType === 'CL' && l.status === 'approved').length;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
