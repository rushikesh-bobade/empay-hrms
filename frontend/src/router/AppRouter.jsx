import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

// Auth
import Login from '../pages/auth/Login';

// Landing / Public
import Landing from '../pages/Landing';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import Settings from '../pages/admin/Settings';

// HR
import HRDashboard from '../pages/hr/HRDashboard';
import Employees from '../pages/hr/Employees';
import HRAttendance from '../pages/hr/HRAttendance';
import HRLeaves from '../pages/hr/HRLeaves';

// Payroll
import PayrollDashboard from '../pages/payroll/PayrollDashboard';
import LeaveApprovals from '../pages/payroll/LeaveApprovals';
import Payruns from '../pages/payroll/Payruns';
import SalaryStructures from '../pages/payroll/SalaryStructures';

// Employee
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyAttendance from '../pages/employee/MyAttendance';
import MyLeaves from '../pages/employee/MyLeaves';
import Directory from '../pages/employee/Directory';

// Shared
import Profile from '../pages/Profile';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard
    const roleRedirects = {
      admin: '/admin/dashboard',
      hr_officer: '/hr/dashboard',
      payroll_officer: '/payroll/dashboard',
      employee: '/dashboard',
    };
    return <Navigate to={roleRedirects[user?.role] || '/login'} replace />;
  }

  return children;
}



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />

          {/* HR */}
          <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['hr_officer', 'admin']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['hr_officer', 'admin']}><Employees /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['hr_officer', 'admin', 'payroll_officer']}><HRAttendance /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['hr_officer', 'admin']}><HRLeaves /></ProtectedRoute>} />

          {/* Payroll */}
          <Route path="/payroll/dashboard" element={<ProtectedRoute allowedRoles={['payroll_officer', 'admin']}><PayrollDashboard /></ProtectedRoute>} />
          <Route path="/payroll/leaves" element={<ProtectedRoute allowedRoles={['payroll_officer', 'admin']}><LeaveApprovals /></ProtectedRoute>} />
          <Route path="/payroll/payruns" element={<ProtectedRoute allowedRoles={['payroll_officer', 'admin']}><Payruns /></ProtectedRoute>} />
          <Route path="/payroll/salary" element={<ProtectedRoute allowedRoles={['payroll_officer', 'admin']}><SalaryStructures /></ProtectedRoute>} />

          {/* Employee */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['employee']}><MyAttendance /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute allowedRoles={['employee']}><MyLeaves /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute allowedRoles={['employee']}><Directory /></ProtectedRoute>} />

          {/* Profile — all roles */}
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
