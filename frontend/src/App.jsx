import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';
import HRDashboard from './pages/hr/HRDashboard';
import Employees from './pages/hr/Employees';
import HRAttendance from './pages/hr/HRAttendance';
import HRLeaves from './pages/hr/HRLeaves';
import PayrollDashboard from './pages/payroll/PayrollDashboard';
import LeaveApprovals from './pages/payroll/LeaveApprovals';
import Payruns from './pages/payroll/Payruns';
import SalaryStructures from './pages/payroll/SalaryStructures';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import MyPayslips from './pages/employee/MyPayslips';
import Directory from './pages/employee/Directory';
import Profile from './pages/shared/Profile';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function RoleRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  const redirects = { admin: '/admin/dashboard', hr_officer: '/hr/dashboard', payroll_officer: '/payroll/dashboard', employee: '/dashboard' };
  return <Navigate to={redirects[user?.role] || '/dashboard'} replace />;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/redirect" element={<RoleRedirect />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Employee */}
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="leaves" element={<MyLeaves />} />
        <Route path="payslips" element={<MyPayslips />} />
        <Route path="directory" element={<Directory />} />
        <Route path="profile" element={<Profile />} />
        {/* Admin */}
        <Route path="admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="admin/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
        {/* HR */}
        <Route path="hr/dashboard" element={<ProtectedRoute roles={['admin', 'hr_officer']}><HRDashboard /></ProtectedRoute>} />
        <Route path="hr/employees" element={<ProtectedRoute roles={['admin', 'hr_officer']}><Employees /></ProtectedRoute>} />
        <Route path="hr/attendance" element={<ProtectedRoute roles={['admin', 'hr_officer', 'payroll_officer']}><HRAttendance /></ProtectedRoute>} />
        <Route path="hr/leaves" element={<ProtectedRoute roles={['admin', 'hr_officer', 'payroll_officer']}><HRLeaves /></ProtectedRoute>} />
        {/* Payroll */}
        <Route path="payroll/dashboard" element={<ProtectedRoute roles={['admin', 'payroll_officer']}><PayrollDashboard /></ProtectedRoute>} />
        <Route path="payroll/leaves" element={<ProtectedRoute roles={['admin', 'payroll_officer']}><LeaveApprovals /></ProtectedRoute>} />
        <Route path="payroll/payruns" element={<ProtectedRoute roles={['admin', 'payroll_officer']}><Payruns /></ProtectedRoute>} />
        <Route path="payroll/salary" element={<ProtectedRoute roles={['admin', 'payroll_officer']}><SalaryStructures /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--chart-tooltip-bg)',
          border: '1px solid var(--chart-tooltip-border)',
          color: 'var(--chart-tooltip-color)',
        },
      }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <AppRoutes />
            <ThemedToaster />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
