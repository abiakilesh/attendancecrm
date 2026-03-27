import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceByUser } from '@/data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function EmployeeAttendance() {
  const { user } = useAuth();
  if (!user) return null;
  const records = getAttendanceByUser(user!.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">My Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Your attendance history</p>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Logout</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No records yet</TableCell></TableRow>
              ) : records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.date}</TableCell>
                  <TableCell>{r.loginTime || '—'}</TableCell>
                  <TableCell>{r.logoutTime || '—'}</TableCell>
                  <TableCell>{r.totalWorkHours > 0 ? `${r.totalWorkHours.toFixed(1)}h` : '—'}</TableCell>
                  <TableCell><Badge variant="outline" className={r.status === 'present' ? 'badge-success' : 'badge-destructive'}>{r.status}</Badge></TableCell>
                  <TableCell>{r.isLate ? <Badge variant="outline" className="badge-warning">Late</Badge> : '—'}</TableCell>
                  <TableCell>{r.fineAmount > 0 ? `₹${r.fineAmount}` : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
