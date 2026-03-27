import { useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser, generateId, getMonthlyLateCount, getMonthlyCLCount, getAttendanceByUser } from '@/data/store';
import { User, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const companies: Company[] = ['Fam Infomedia', 'Feathers Groups', 'Feather Groups'];
const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support'];

const emptyForm: Partial<User> = {
  name: '', email: '', password: '', department: '', designation: '',
  phone: '', company: 'Fam Infomedia', salary: 0, joiningDate: new Date().toISOString().split('T')[0],
  role: 'employee',
};

export default function AdminEmployees() {
  const [users, setUsers] = useState(() => getUsers().filter(u => u.role === 'employee'));
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>(emptyForm);

  const refresh = () => setUsers(getUsers().filter(u => u.role === 'employee'));

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchCompany = companyFilter === 'all' || u.company === companyFilter;
    return matchSearch && matchCompany;
  });

  const managers = getUsers().filter(u => u.role === 'manager');

  const handleSave = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (editingUser) {
      updateUser(editingUser.id, form);
      toast.success('Employee updated');
    } else {
      const newUser: User = {
        ...form as User,
        id: generateId('EMP'),
        role: 'employee',
      };
      addUser(newUser);
      toast.success('Employee created');
    }
    setDialogOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    refresh();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm(user);
    setDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Delete ${user.name}?`)) {
      deleteUser(user.id);
      toast.success('Employee deleted');
      refresh();
    }
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all employee accounts</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Company summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {companies.map(c => {
          const count = users.filter(u => u.company === c).length;
          return (
            <div key={c} className="stat-card cursor-pointer hover:border-primary/30" onClick={() => setCompanyFilter(c)}>
              <p className="text-sm font-medium text-muted-foreground">{c}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
              <p className="text-xs text-muted-foreground">employees</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Late Count</TableHead>
                <TableHead>Leave Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{u.company}</Badge>
                  </TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>{u.designation}</TableCell>
                  <TableCell>{u.phone || '—'}</TableCell>
                  <TableCell>₹{u.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={getMonthlyLateCount(u.id) > 3 ? 'text-destructive font-semibold' : ''}>
                      {getMonthlyLateCount(u.id)}
                    </span>
                  </TableCell>
                  <TableCell>{getMonthlyCLCount(u.id)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(u)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Select value={form.company} onValueChange={v => setForm({ ...form, company: v as Company })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={form.designation || ''} onChange={e => setForm({ ...form, designation: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Salary (₹)</Label>
                <Input type="number" value={form.salary || 0} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input type="date" value={form.joiningDate || ''} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Assigned Manager</Label>
                <Select value={form.managerId || 'none'} onValueChange={v => setForm({ ...form, managerId: v === 'none' ? undefined : v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager</SelectItem>
                    {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">
              {editingUser ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-3 text-sm">
              {[
                ['Name', viewingUser.name],
                ['ID', viewingUser.id],
                ['Email', viewingUser.email],
                ['Company', viewingUser.company],
                ['Department', viewingUser.department],
                ['Designation', viewingUser.designation],
                ['Phone', viewingUser.phone || '—'],
                ['Salary', `₹${viewingUser.salary.toLocaleString()}`],
                ['Joining Date', viewingUser.joiningDate],
                ['Monthly Late Count', getMonthlyLateCount(viewingUser.id).toString()],
                ['Monthly CL Count', getMonthlyCLCount(viewingUser.id).toString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
