import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceByUser, getMonthlyLateCount, getMonthlyCLCount } from '@/data/store';

export default function EmployeeSummary() {
  const { user } = useAuth();
  if (!user) return null;
  const monthStr = new Date().toISOString().slice(0, 7);
  const monthly = getAttendanceByUser(user!.id).filter(a => a.date.startsWith(monthStr));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">My Summary</h1>
        <p className="text-muted-foreground text-sm mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-sm text-muted-foreground">Present Days</p><p className="text-3xl font-bold text-foreground mt-1">{monthly.filter(a => a.status === 'present').length}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Absent Days</p><p className="text-3xl font-bold text-foreground mt-1">{monthly.filter(a => a.status === 'absent').length}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Late Days</p><p className="text-3xl font-bold text-warning mt-1">{getMonthlyLateCount(user.id)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Total Fines</p><p className="text-3xl font-bold text-destructive mt-1">₹{monthly.reduce((s, a) => s + a.fineAmount, 0)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">CL Used</p><p className="text-3xl font-bold text-foreground mt-1">{getMonthlyCLCount(user.id)} / 1</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Avg Work Hours</p><p className="text-3xl font-bold text-foreground mt-1">{monthly.length > 0 ? (monthly.reduce((s, a) => s + a.totalWorkHours, 0) / monthly.length).toFixed(1) : 0}h</p></div>
      </div>
    </div>
  );
}
