import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayAttendance, upsertAttendance, getMonthlyLateCount, getMonthlyCLCount, getAttendanceByUser, getTimingRulesByCompany, generateId } from '@/data/store';
import { AttendanceRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Coffee, UtensilsCrossed, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function now() { return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }); }

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [record, setRecord] = useState<AttendanceRecord | undefined>(undefined);

  useEffect(() => {
    if (user) setRecord(getTodayAttendance(user.id));
  }, [user]);

  if (!user) return null;

  const rules = getTimingRulesByCompany(user.company);
  const monthlyLate = getMonthlyLateCount(user.id);
  const monthlyCL = getMonthlyCLCount(user.id);
  const monthAttendance = getAttendanceByUser(user.id).filter(a => a.date.startsWith(new Date().toISOString().slice(0, 7)));

  const save = (updated: AttendanceRecord) => {
    upsertAttendance(updated);
    setRecord(updated);
  };

  const handleLogin = () => {
    const time = now();
    const [h, m] = time.split(':').map(Number);
    const [sh, sm] = rules.officeStartTime.split(':').map(Number);
    const lateMinutes = (h * 60 + m) - (sh * 60 + sm);
    const isLate = lateMinutes > rules.lateThresholdMinutes;
    const rec: AttendanceRecord = {
      id: record?.id || generateId('ATT'),
      userId: user.id, date: today, loginTime: time, status: 'present',
      isLate, fineAmount: isLate ? rules.lateFineAmount : 0,
      totalWorkHours: 0, lunchExceeded: false, breakExceeded: false,
    };
    save(rec);
    toast.success(isLate ? `Logged in late at ${time}. ₹${rules.lateFineAmount} fine applied.` : `Logged in at ${time}`);
  };

  const handleLogout = () => {
    if (!record) return;
    const time = now();
    const updated = { ...record, logoutTime: time };
    // Calculate work hours
    if (record.loginTime) {
      const [lh, lm] = record.loginTime.split(':').map(Number);
      const [oh, om] = time.split(':').map(Number);
      const totalMin = (oh * 60 + om) - (lh * 60 + lm);
      updated.totalWorkHours = Math.max(0, (totalMin - (record.lunchExceeded ? 0 : 30) - 45) / 60);
    }
    save(updated);
    toast.success(`Logged out at ${time}`);
  };

  const handleBreak = (type: 'morningBreakStart' | 'morningBreakEnd' | 'eveningBreakStart' | 'eveningBreakEnd') => {
    if (!record) return;
    save({ ...record, [type]: now() });
    toast.success(`${type.replace(/([A-Z])/g, ' $1')} marked at ${now()}`);
  };

  const handleLunch = (type: 'lunchStart' | 'lunchEnd') => {
    if (!record) return;
    const updated = { ...record, [type]: now() };
    if (type === 'lunchEnd' && record.lunchStart) {
      const [sh, sm] = record.lunchStart.split(':').map(Number);
      const [eh, em] = now().split(':').map(Number);
      const duration = (eh * 60 + em) - (sh * 60 + sm);
      if (duration > rules.lunchDurationMinutes) {
        updated.lunchExceeded = true;
        toast.warning(`Lunch exceeded ${rules.lunchDurationMinutes} min limit!`);
      }
    }
    save(updated);
    toast.success(`${type === 'lunchStart' ? 'Lunch started' : 'Lunch ended'} at ${now()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Employee Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user.name}</p>
      </div>

      {/* Profile cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-sm text-muted-foreground">Employee ID</p><p className="text-lg font-bold text-foreground mt-1">{user.id}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Department</p><p className="text-lg font-bold text-foreground mt-1">{user.department}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Company</p><p className="text-lg font-bold text-foreground mt-1">{user.company}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Designation</p><p className="text-lg font-bold text-foreground mt-1">{user.designation}</p></div>
      </div>

      {/* Today's attendance */}
      <div className="stat-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Today's Attendance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
          <div><span className="text-muted-foreground">Login</span><p className="font-semibold text-foreground">{record?.loginTime || '—'}</p></div>
          <div><span className="text-muted-foreground">Logout</span><p className="font-semibold text-foreground">{record?.logoutTime || '—'}</p></div>
          <div><span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className={record?.status === 'present' ? 'badge-success' : 'badge-warning'}>
              {record?.status || 'not marked'}
            </Badge>
          </div>
          <div><span className="text-muted-foreground">Late</span>
            {record?.isLate ? <Badge variant="outline" className="badge-warning">Yes (₹{record.fineAmount})</Badge> : <span className="font-medium text-foreground">No</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button onClick={handleLogin} disabled={!!record?.loginTime} className="gap-2"><LogIn className="w-4 h-4" /> Login</Button>
          <Button onClick={handleLogout} disabled={!record?.loginTime || !!record?.logoutTime} variant="outline" className="gap-2"><LogOut className="w-4 h-4" /> Logout</Button>
          <Button onClick={() => handleBreak('morningBreakStart')} disabled={!record?.loginTime || !!record?.morningBreakStart} variant="outline" className="gap-2 text-xs"><Coffee className="w-4 h-4" /> AM Break</Button>
          <Button onClick={() => handleBreak('morningBreakEnd')} disabled={!record?.morningBreakStart || !!record?.morningBreakEnd} variant="outline" className="gap-2 text-xs"><Coffee className="w-4 h-4" /> AM End</Button>
          <Button onClick={() => handleLunch('lunchStart')} disabled={!record?.loginTime || !!record?.lunchStart} variant="outline" className="gap-2 text-xs"><UtensilsCrossed className="w-4 h-4" /> Lunch</Button>
          <Button onClick={() => handleLunch('lunchEnd')} disabled={!record?.lunchStart || !!record?.lunchEnd} variant="outline" className="gap-2 text-xs"><UtensilsCrossed className="w-4 h-4" /> Lunch End</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-3">
          <Button onClick={() => handleBreak('eveningBreakStart')} disabled={!record?.loginTime || !!record?.eveningBreakStart} variant="outline" className="gap-2 text-xs"><Coffee className="w-4 h-4" /> PM Break</Button>
          <Button onClick={() => handleBreak('eveningBreakEnd')} disabled={!record?.eveningBreakStart || !!record?.eveningBreakEnd} variant="outline" className="gap-2 text-xs"><Coffee className="w-4 h-4" /> PM End</Button>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Present Days</p>
          <p className="text-2xl font-bold text-foreground mt-1">{monthAttendance.filter(a => a.status === 'present').length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Late Count</p>
          <p className={`text-2xl font-bold mt-1 ${monthlyLate > 3 ? 'text-destructive' : 'text-foreground'}`}>{monthlyLate} / 3</p>
          {monthlyLate > 3 && <p className="text-xs text-destructive mt-1">⚠ Exceeded limit</p>}
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">CL Used</p>
          <p className={`text-2xl font-bold mt-1 ${monthlyCL > 1 ? 'text-destructive' : 'text-foreground'}`}>{monthlyCL} / 1</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Fines</p>
          <p className="text-2xl font-bold text-destructive mt-1">₹{monthAttendance.reduce((s, a) => s + a.fineAmount, 0)}</p>
        </div>
      </div>
    </div>
  );
}
