import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../shared/RoleBadge';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarOff, Banknote, Settings,
  UserPlus, CheckSquare, Receipt, DollarSign, FolderOpen, FileText,
  ChevronLeft, ChevronRight, LogOut, Briefcase
} from 'lucide-react';

const navItems = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Attendance', icon: CalendarCheck, path: '/hr/attendance' },
    { label: 'Leaves', icon: CalendarOff, path: '/hr/leaves' },
    { label: 'Payroll', icon: Banknote, path: '/payroll/payruns' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
  hr_officer: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hr/dashboard' },
    { label: 'Employees', icon: UserPlus, path: '/hr/employees' },
    { label: 'Attendance', icon: CalendarCheck, path: '/hr/attendance' },
    { label: 'Leaves', icon: CalendarOff, path: '/hr/leaves' },
  ],
  payroll_officer: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/payroll/dashboard' },
    { label: 'Leave Approvals', icon: CheckSquare, path: '/payroll/leaves' },
    { label: 'Payruns', icon: Receipt, path: '/payroll/payruns' },
    { label: 'Salary Structures', icon: DollarSign, path: '/payroll/salary' },
  ],
  employee: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Attendance', icon: CalendarCheck, path: '/attendance' },
    { label: 'My Leaves', icon: CalendarOff, path: '/leaves' },
    { label: 'My Payslips', icon: FileText, path: '/payslips' },
    { label: 'Directory', icon: FolderOpen, path: '/directory' },
  ],
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-[68px]' : 'w-[250px]'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fadeIn">
              <h1 className="text-lg font-bold text-white tracking-tight">EmPay</h1>
              <p className="text-[10px] text-slate-500 -mt-1">Smart HRMS</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="animate-fadeIn">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <RoleBadge role={user?.role} className="mt-0.5" />
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
