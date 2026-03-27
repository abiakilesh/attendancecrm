import { useAuth } from '@/contexts/AuthContext';
import { getUsersByManager, getAttendanceByDate, getPendingLeavesByManager, getMonthlyLateCount } from '@/data/store';
import { Users, Clock, AlertTriangle, ClipboardList } from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  

  const team = getUsersByManager(user.id);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = getAttendanceByDate(today);
  const teamAttendance = todayAttendance.filter(a => team.some(t => t.id === a.userId));
  const presentCount = teamAttendance.filter(a => a.status === 'present').length;
  const lateCount = teamAttendance.filter(a => a.isLate).length;
  const pendingLeaves = getPendingLeavesByManager(user.id).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user.name} — {user.department}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-muted-foreground">Team Size</p><p className="text-3xl font-bold text-foreground mt-1">{team.length}</p></div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-muted-foreground">Present Today</p><p className="text-3xl font-bold text-success mt-1">{presentCount}</p></div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><Clock className="w-6 h-6 text-success" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-muted-foreground">Late Today</p><p className="text-3xl font-bold text-warning mt-1">{lateCount}</p></div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-warning" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-muted-foreground">Pending Leaves</p><p className="text-3xl font-bold text-info mt-1">{pendingLeaves}</p></div>
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center"><ClipboardList className="w-6 h-6 text-info" /></div>
          </div>
        </div>
      </div>

      {/* Team list */}
      <div className="stat-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Team Members</h2>
        {team.length === 0 ? (
          <p className="text-muted-foreground text-sm">No team members assigned yet. Ask admin to assign employees to your team.</p>
        ) : (
          <div className="space-y-3">
            {team.map(member => {
              const att = teamAttendance.find(a => a.userId === member.id);
              return (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.id} • {member.designation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${att?.status === 'present' ? 'text-success' : 'text-muted-foreground'}`}>
                      {att?.status || 'absent'}
                    </span>
                    {att?.isLate && <span className="text-xs text-warning font-medium">Late</span>}
                    <span className="text-xs text-muted-foreground">Late: {getMonthlyLateCount(member.id)}/3</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
