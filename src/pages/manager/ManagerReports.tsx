import { useAuth } from '@/contexts/AuthContext';
import { getUsersByManager, getAttendanceByUser, getMonthlyLateCount, getMonthlyCLCount } from '@/data/store';

export default function ManagerReports() {
  const { user } = useAuth();
  if (!user) return null;
  
  const team = getUsersByManager(user.id);
  const monthStr = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-header">Team Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {team.length === 0 ? (
          <div className="stat-card col-span-2"><p className="text-muted-foreground">No team members assigned</p></div>
        ) : team.map(member => {
          const monthly = getAttendanceByUser(member.id).filter(a => a.date.startsWith(monthStr));
          return (
            <div key={member.id} className="stat-card">
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{member.id} • {member.designation}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Present</span><span className="font-medium">{monthly.filter(a => a.status === 'present').length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Late</span><span className="font-medium text-warning">{getMonthlyLateCount(member.id)}/3</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CL Used</span><span className="font-medium">{getMonthlyCLCount(member.id)}/1</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fines</span><span className="font-medium text-destructive">₹{monthly.reduce((s, a) => s + a.fineAmount, 0)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
