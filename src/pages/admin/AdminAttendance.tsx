import { useState } from 'react';
import { getAttendanceRecords, getUsers } from '@/data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Search, Filter } from 'lucide-react';

export default function AdminAttendance() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const records = getAttendanceRecords().filter(a => a.date === dateFilter);
  const users = getUsers();

  const filtered = records.filter(r => {
    const user = users.find(u => u.id === r.userId);
    return user && (user.name.toLowerCase().includes(search.toLowerCase()) || user.id.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Attendance Records</h1>
        <p className="text-muted-foreground text-sm mt-1">View and monitor all attendance data</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full sm:w-48" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Logout</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Lunch</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No attendance records for {dateFilter}
                  </TableCell>
                </TableRow>
              ) : filtered.map(r => {
                const user = users.find(u => u.id === r.userId);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{user?.name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{r.userId}</TableCell>
                    <TableCell>{r.loginTime || '—'}</TableCell>
                    <TableCell>{r.logoutTime || '—'}</TableCell>
                    <TableCell className="text-xs">
                      {r.morningBreakStart && `${r.morningBreakStart}-${r.morningBreakEnd || '...'}`}
                      {r.eveningBreakStart && `, ${r.eveningBreakStart}-${r.eveningBreakEnd || '...'}`}
                      {!r.morningBreakStart && !r.eveningBreakStart && '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.lunchStart ? `${r.lunchStart}-${r.lunchEnd || '...'}` : '—'}
                      {r.lunchExceeded && <Badge variant="outline" className="ml-1 badge-warning text-[10px]">Over</Badge>}
                    </TableCell>
                    <TableCell>{r.totalWorkHours > 0 ? `${r.totalWorkHours.toFixed(1)}h` : '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        r.status === 'present' ? 'badge-success' :
                        r.status === 'absent' ? 'badge-destructive' :
                        r.status === 'leave' ? 'badge-info' : 'badge-warning'
                      }>{r.status}</Badge>
                    </TableCell>
                    <TableCell>{r.isLate ? <Badge variant="outline" className="badge-warning">Late</Badge> : '—'}</TableCell>
                    <TableCell>{r.fineAmount > 0 ? `₹${r.fineAmount}` : '—'}</TableCell>
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
