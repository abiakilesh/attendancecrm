import { useState } from 'react';
import { getLeaveRequests, getUsers, updateLeaveRequest } from '@/data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState(getLeaveRequests);
  const [search, setSearch] = useState('');
  const users = getUsers();

  const refresh = () => setLeaves(getLeaveRequests());

  const filtered = leaves.filter(l => {
    const user = users.find(u => u.id === l.userId);
    return user && (user.name.toLowerCase().includes(search.toLowerCase()) || l.leaveType.toLowerCase().includes(search.toLowerCase()));
  });

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    updateLeaveRequest(id, { status });
    toast.success(`Leave ${status}`);
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Leave Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage all leave requests</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leave requests</TableCell></TableRow>
              ) : filtered.map(l => {
                const user = users.find(u => u.id === l.userId);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{user?.name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{l.userId}</TableCell>
                    <TableCell><Badge variant="outline">{l.leaveType}</Badge></TableCell>
                    <TableCell className="max-w-48 truncate">{l.purpose}</TableCell>
                    <TableCell>{l.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        l.status === 'approved' ? 'badge-success' :
                        l.status === 'rejected' ? 'badge-destructive' : 'badge-warning'
                      }>{l.status}</Badge>
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
