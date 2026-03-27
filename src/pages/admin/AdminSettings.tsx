import { getTimingRules } from '@/data/store';

export default function AdminSettings() {
  const rules = getTimingRules();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Office timing rules and company policies</p>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.company} className="stat-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">{rule.company}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Office Start</span><span className="font-medium">{rule.officeStartTime}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Office End</span><span className="font-medium">{rule.officeEndTime}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Morning Break</span><span className="font-medium">{rule.morningBreakStart} – {rule.morningBreakEnd}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Evening Break</span><span className="font-medium">{rule.eveningBreakStart} – {rule.eveningBreakEnd}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Lunch Duration</span><span className="font-medium">{rule.lunchDurationMinutes} min</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Work/Day</span><span className="font-medium">{Math.floor(rule.totalWorkHoursPerDay / 60)}h {rule.totalWorkHoursPerDay % 60}m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Break/Day</span><span className="font-medium">{rule.totalBreakMinutesPerDay} min</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Late Fine</span><span className="font-medium">₹{rule.lateFineAmount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Late Threshold</span><span className="font-medium">{rule.lateThresholdMinutes} min after start</span></div>
              </div>
            </div>
          </div>
        ))}

        <div className="stat-card">
          <h2 className="text-lg font-semibold text-foreground mb-3">General Policies</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Max Late/Month</span><span className="font-medium">3</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max CL/Month</span><span className="font-medium">1</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dress Code</span><span className="font-medium">Formal (Mandatory)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
