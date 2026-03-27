import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addLeaveRequest, getLeavesByUser, generateId, getMonthlyCLCount } from '@/data/store';
import { LeaveType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function EmployeeLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<ReturnType<typeof getLeavesByUser>>([]);
  const [leaveType, setLeaveType] = useState<LeaveType>('CL');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (user) setLeaves(getLeavesByUser(user.id));
  }, [user]);

  if (!user) return null;

  const handleApply = () => {
    if (!purpose || !date) { toast.error('Fill all fields'); return; }
    if (leaveType === 'CL' && getMonthlyCLCount(user.id) >= 1) {
      toast.warning('You have already used your monthly CL. This will need special approval.');
    }
    addLeaveRequest({
      id: generateId('LVE'),
      userId: user.id,
      leaveType, purpose, date,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    toast.success('Leave request submitted');
    setPurpose(''); setDate('');
    setLeaves(getLeavesByUser(user.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-header">Leave Requests</h1>

      <div className="stat-card">
        <h2 className="font-semibold text-foreground mb-4">Apply for Leave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={v => setLeaveType(v as LeaveType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CL">Casual Leave</SelectItem>
                <SelectItem value="SL">Sick Leave</SelectItem>
                <SelectItem value="EL">Earned Leave</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="space-y-2"><Label>Purpose</Label><Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Reason..." /></div>
        </div>
        <Button onClick={handleApply} className="mt-4">Submit Request</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No leave requests</TableCell></TableRow>
              ) : leaves.map(l => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="outline">{l.leaveType}</Badge></TableCell>
                  <TableCell>{l.date}</TableCell>
                  <TableCell className="max-w-48 truncate">{l.purpose}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-destructive' : 'badge-warning'
                    }>{l.status}</Badge>
                  </TableCell>
                  <TableCell>{l.remarks || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
