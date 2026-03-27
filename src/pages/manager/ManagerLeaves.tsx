import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingLeavesByManager, getLeaveRequests, getUsersByManager, getUsers, updateLeaveRequest, getMonthlyCLCount, getMonthlyLateCount } from '@/data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagerLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<ReturnType<typeof getLeaveRequests>>([]);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const users = getUsers();

  if (!user) return null;

  const team = getUsersByManager(user.id);
  const teamIds = team.map(t => t.id);

  const refresh = () => setLeaves(getLeaveRequests().filter(l => teamIds.includes(l.userId)));

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    updateLeaveRequest(id, { status, remarks: remarks[id] || '', approvedBy: user.id });
    toast.success(`Leave ${status}`);
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-header">Leave Requests</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Leaves This Month</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Late Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No leave requests</TableCell></TableRow>
              ) : leaves.map(l => {
                const emp = users.find(u => u.id === l.userId);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{emp?.name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{l.userId}</TableCell>
                    <TableCell>{getMonthlyCLCount(l.userId)}</TableCell>
                    <TableCell><Badge variant="outline">{l.leaveType}</Badge></TableCell>
                    <TableCell className="max-w-32 truncate">{l.purpose}</TableCell>
                    <TableCell>{l.date}</TableCell>
                    <TableCell>{getMonthlyLateCount(l.userId)}/3</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-destructive' : 'badge-warning'}>{l.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {l.status === 'pending' ? (
                        <Input placeholder="Remarks" value={remarks[l.id] || ''} onChange={e => setRemarks({ ...remarks, [l.id]: e.target.value })} className="w-24 text-xs h-8" />
                      ) : (l.remarks || '—')}
                    </TableCell>
                    <TableCell>
                      {l.status === 'pending' && (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleAction(l.id, 'approved')} className="text-success hover:text-success"><CheckCircle className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleAction(l.id, 'rejected')} className="text-destructive hover:text-destructive"><XCircle className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </TableCell>
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
