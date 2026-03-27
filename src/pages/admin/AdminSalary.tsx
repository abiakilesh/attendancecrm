import { getUsers, getAttendanceRecords } from '@/data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminSalary() {
  const employees = getUsers().filter(u => u.role === 'employee');
  const monthStr = new Date().toISOString().slice(0, 7);
  const allAttendance = getAttendanceRecords();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Salary Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Monthly salary calculations and deductions</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Late Fines</TableHead>
                <TableHead>Net Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No employees</TableCell></TableRow>
              ) : employees.map(emp => {
                const monthlyFines = allAttendance
                  .filter(a => a.userId === emp.id && a.date.startsWith(monthStr))
                  .reduce((s, a) => s + a.fineAmount, 0);
                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="font-mono text-xs">{emp.id}</TableCell>
                    <TableCell><Badge variant="outline">{emp.company}</Badge></TableCell>
                    <TableCell>₹{emp.salary.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">₹{monthlyFines}</TableCell>
                    <TableCell className="font-semibold">₹{(emp.salary - monthlyFines).toLocaleString()}</TableCell>
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
