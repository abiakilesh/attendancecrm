import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import LoginPage from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEmployees from "@/pages/admin/AdminEmployees";
import AdminManagers from "@/pages/admin/AdminManagers";
import AdminAttendance from "@/pages/admin/AdminAttendance";
import AdminLeaves from "@/pages/admin/AdminLeaves";
import AdminSalary from "@/pages/admin/AdminSalary";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import EmployeeAttendance from "@/pages/employee/EmployeeAttendance";
import EmployeeSummary from "@/pages/employee/EmployeeSummary";
import EmployeeLeaves from "@/pages/employee/EmployeeLeaves";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerAttendance from "@/pages/manager/ManagerAttendance";
import ManagerLeaves from "@/pages/manager/ManagerLeaves";
import ManagerReports from "@/pages/manager/ManagerReports";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AuthRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'manager') return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
}

function LoginGuard() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/employee" replace />;
  }
  return <LoginPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/login" element={<LoginGuard />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/managers" element={<ProtectedRoute allowedRoles={['admin']}><AdminManagers /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployees /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeaves /></ProtectedRoute>} />
            <Route path="/admin/salary" element={<ProtectedRoute allowedRoles={['admin']}><AdminSalary /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><ProfilePage /></ProtectedRoute>} />

            {/* Manager routes */}
            <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/manager/attendance" element={<ProtectedRoute allowedRoles={['manager']}><ManagerAttendance /></ProtectedRoute>} />
            <Route path="/manager/leaves" element={<ProtectedRoute allowedRoles={['manager']}><ManagerLeaves /></ProtectedRoute>} />
            <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={['manager']}><ManagerReports /></ProtectedRoute>} />
            <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={['manager']}><ProfilePage /></ProtectedRoute>} />

            {/* Employee routes */}
            <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
            <Route path="/employee/summary" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeSummary /></ProtectedRoute>} />
            <Route path="/employee/leaves" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLeaves /></ProtectedRoute>} />
            <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
