import { getUsers, getAttendanceRecords, getLeaveRequests } from '@/data/store';
import { Company } from '@/types';

export default function AdminReports() {
  const employees = getUsers().filter(u => u.role === 'employee');
  const monthStr = new Date().toISOString().slice(0, 7);
  const attendance = getAttendanceRecords().filter(a => a.date.startsWith(monthStr));
  const leaves = getLeaveRequests().filter(l => l.date.startsWith(monthStr));
  const companies: Company[] = ['Fam Infomedia', 'Feathers Groups', 'Feather Groups'];

  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const totalLate = attendance.filter(a => a.isLate).length;
  const totalFines = attendance.reduce((s, a) => s + a.fineAmount, 0);
  const totalLeaves = leaves.filter(l => l.status === 'approved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Monthly overview — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Present Records</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalPresent}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Late Entries</p>
          <p className="text-3xl font-bold text-warning mt-1">{totalLate}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Fines</p>
          <p className="text-3xl font-bold text-destructive mt-1">₹{totalFines}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Approved Leaves</p>
          <p className="text-3xl font-bold text-info mt-1">{totalLeaves}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Department-wise Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map(company => {
            const compEmps = employees.filter(e => e.company === company);
            const compAttendance = attendance.filter(a => compEmps.some(e => e.id === a.userId));
            return (
              <div key={company} className="stat-card">
                <h3 className="font-semibold text-foreground mb-3">{company}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Employees</span><span className="font-medium">{compEmps.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Present Records</span><span className="font-medium">{compAttendance.filter(a => a.status === 'present').length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Late Entries</span><span className="font-medium text-warning">{compAttendance.filter(a => a.isLate).length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fines</span><span className="font-medium text-destructive">₹{compAttendance.reduce((s, a) => s + a.fineAmount, 0)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
