import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateCurrentUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) return null;

  const handleChangePassword = () => {
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    updateUser(user.id, { password: newPassword });
    updateCurrentUser({ password: newPassword });
    toast.success('Password updated');
    setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="page-header">Profile</h1>

      <div className="stat-card">
        <h2 className="font-semibold text-foreground mb-4">Personal Information</h2>
        <div className="space-y-3 text-sm">
          {[
            ['Name', user.name],
            ['ID', user.id],
            ['Email', user.email],
            ['Role', user.role],
            ['Company', user.company],
            ['Department', user.department],
            ['Designation', user.designation],
            ['Phone', user.phone || '—'],
            ['Joining Date', user.joiningDate],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card">
        <h2 className="font-semibold text-foreground mb-4">Change Password</h2>
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
          <Button onClick={handleChangePassword}>Update Password</Button>
        </div>
      </div>
    </div>
  );
}
