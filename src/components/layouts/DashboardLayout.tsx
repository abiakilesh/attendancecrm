import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, FileText,
  DollarSign, Settings, User, LogOut, Menu, X, ClipboardList,
  Building2, ChevronRight, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Managers', path: '/admin/managers', icon: <UserCheck className="w-5 h-5" /> },
  { label: 'Employees', path: '/admin/employees', icon: <Users className="w-5 h-5" /> },
  { label: 'Attendance', path: '/admin/attendance', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'Leave Management', path: '/admin/leaves', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Salary', path: '/admin/salary', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Reports', path: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

const managerNav: NavItem[] = [
  { label: 'Dashboard', path: '/manager', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Team Attendance', path: '/manager/attendance', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'Leave Requests', path: '/manager/leaves', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Reports', path: '/manager/reports', icon: <FileText className="w-5 h-5" /> },
];

const employeeNav: NavItem[] = [
  { label: 'Dashboard', path: '/employee', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Attendance', path: '/employee/attendance', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'My Summary', path: '/employee/summary', icon: <FileText className="w-5 h-5" /> },
  { label: 'Leave Request', path: '/employee/leaves', icon: <ClipboardList className="w-5 h-5" /> },
];

function getNav(role: Role): NavItem[] {
  switch (role) {
    case 'admin': return adminNav;
    case 'manager': return managerNav;
    case 'employee': return employeeNav;
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;
  const nav = getNav(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
          <Building2 className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg text-sidebar-primary-foreground">Attendance CRM</span>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/manager' || item.path === '/employee'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn("sidebar-item", isActive ? "sidebar-item-active" : "sidebar-item-inactive")
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <NavLink
            to={`/${user.role}/profile`}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn("sidebar-item mb-2", isActive ? "sidebar-item-active" : "sidebar-item-inactive")
            }
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-item sidebar-item-inactive w-full text-left">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-8 gap-4 shrink-0">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role} • {user.department}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
