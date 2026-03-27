import { useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser, generateId } from '@/data/store';
import { User, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const companies: Company[] = ['Fam Infomedia', 'Feathers Groups', 'Feather Groups'];
const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support'];

const emptyForm: Partial<User> = {
  name: '', email: '', password: '', department: '', designation: '',
  phone: '', company: 'Fam Infomedia', salary: 0, joiningDate: new Date().toISOString().split('T')[0],
  role: 'manager',
};

export default function AdminManagers() {
  const [users, setUsers] = useState(() => getUsers().filter(u => u.role === 'manager'));
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>(emptyForm);

  const refresh = () => setUsers(getUsers().filter(u => u.role === 'manager'));

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (editingUser) {
      updateUser(editingUser.id, form);
      toast.success('Manager updated');
    } else {
      addUser({ ...form as User, id: generateId('MGR'), role: 'manager' });
      toast.success('Manager created');
    }
    setDialogOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    refresh();
  };

  const handleDelete = (user: User) => {
    if (confirm(`Delete ${user.name}?`)) {
      deleteUser(user.id);
      toast.success('Manager deleted');
      refresh();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Managers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all manager accounts</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Manager
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search managers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No managers found</TableCell>
                </TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{u.company}</Badge></TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>{getUsers().filter(e => e.managerId === u.id).length}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setForm(u); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Manager' : 'Add New Manager'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={form.company} onValueChange={v => setForm({ ...form, company: v as Company })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Designation</Label><Input value={form.designation || ''} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
              <div className="space-y-2"><Label>Salary (₹)</Label><Input type="number" value={form.salary || 0} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} /></div>
            </div>
            <Button onClick={handleSave} className="w-full mt-2">{editingUser ? 'Update Manager' : 'Create Manager'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
