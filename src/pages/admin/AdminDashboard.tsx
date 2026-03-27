import { useAuth } from '@/contexts/AuthContext';
import { getUsers, getAttendanceRecords, getLeaveRequests, getAttendanceByDate } from '@/data/store';
import { Users, UserCheck, Clock, AlertTriangle, DollarSign, CalendarDays, TrendingUp, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const allUsers = getUsers();
  const employees = allUsers.filter(u => u.role === 'employee');
  const managers = allUsers.filter(u => u.role === 'manager');
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = getAttendanceByDate(today);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.isLate).length;
  const totalFines = todayAttendance.reduce((s, a) => s + a.fineAmount, 0);
  const allAttendance = getAttendanceRecords();
  const monthStr = new Date().toISOString().slice(0, 7);
  const monthlyFines = allAttendance.filter(a => a.date.startsWith(monthStr)).reduce((s, a) => s + a.fineAmount, 0);
  const pendingLeaves = getLeaveRequests().filter(l => l.status === 'pending').length;

  const companies = ['Fam Infomedia', 'Feathers Groups', 'Feather Groups'] as const;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-6 h-6 text-primary" />} label="Total Employees" value={employees.length} color="bg-primary/10" />
        <StatCard icon={<UserCheck className="w-6 h-6 text-success" />} label="Total Managers" value={managers.length} color="bg-success/10" />
        <StatCard icon={<Clock className="w-6 h-6 text-info" />} label="Present Today" value={presentCount} sub={`of ${employees.length} employees`} color="bg-info/10" />
        <StatCard icon={<AlertTriangle className="w-6 h-6 text-warning" />} label="Late Today" value={lateCount} color="bg-warning/10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-6 h-6 text-destructive" />} label="Total Fines Today" value={`₹${totalFines}`} color="bg-destructive/10" />
        <StatCard icon={<TrendingUp className="w-6 h-6 text-primary" />} label="Monthly Fines" value={`₹${monthlyFines}`} color="bg-primary/10" />
        <StatCard icon={<CalendarDays className="w-6 h-6 text-warning" />} label="Pending Leaves" value={pendingLeaves} color="bg-warning/10" />
        <StatCard icon={<Users className="w-6 h-6 text-muted-foreground" />} label="Absent Today" value={employees.length - presentCount} color="bg-muted" />
      </div>

      {/* Company-wise breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Company-wise Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map(company => {
            const compEmployees = employees.filter(e => e.company === company);
            return (
              <div key={company} className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{company}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Employees</span>
                    <span className="font-medium text-foreground">{compEmployees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Present Today</span>
                    <span className="font-medium text-success">{todayAttendance.filter(a => compEmployees.some(e => e.id === a.userId) && a.status === 'present').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Late Today</span>
                    <span className="font-medium text-warning">{todayAttendance.filter(a => compEmployees.some(e => e.id === a.userId) && a.isLate).length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
