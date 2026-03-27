import { useAuth } from '@/contexts/AuthContext';
import { getUsersByManager, getAttendanceByDate } from '@/data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ManagerAttendance() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!user) return null;

  const team = getUsersByManager(user.id);
  const attendance = getAttendanceByDate(date);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="page-header">Team Attendance</h1></div>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-48" />
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Logout</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No team members</TableCell></TableRow>
              ) : team.map(member => {
                const att = attendance.find(a => a.userId === member.id);
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{att?.loginTime || '—'}</TableCell>
                    <TableCell>{att?.logoutTime || '—'}</TableCell>
                    <TableCell>{att?.totalWorkHours ? `${att.totalWorkHours.toFixed(1)}h` : '—'}</TableCell>
                    <TableCell><Badge variant="outline" className={att?.status === 'present' ? 'badge-success' : 'badge-destructive'}>{att?.status || 'absent'}</Badge></TableCell>
                    <TableCell>{att?.isLate ? <Badge variant="outline" className="badge-warning">Late</Badge> : '—'}</TableCell>
                    <TableCell>{att?.fineAmount ? `₹${att.fineAmount}` : '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
