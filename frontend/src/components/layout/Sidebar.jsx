import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarOff, Banknote,
  Settings, UserPlus, CheckSquare, Receipt, DollarSign,
  BookUser, FileText, LogOut, Building2
} from 'lucide-react';

const roleMenus = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { label: 'Leaves', path: '/hr/leaves', icon: CalendarOff },
    { label: 'Payroll', path: '/payroll/payruns', icon: Banknote },
    { label: 'Salary Structures', path: '/payroll/salary', icon: DollarSign },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  hr_officer: [
    { label: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/hr/employees', icon: UserPlus },
    { label: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { label: 'Leaves', path: '/hr/leaves', icon: CalendarOff },
  ],
  payroll_officer: [
    { label: 'Dashboard', path: '/payroll/dashboard', icon: LayoutDashboard },
    { label: 'Leave Approvals', path: '/payroll/leaves', icon: CheckSquare },
    { label: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { label: 'Payruns', path: '/payroll/payruns', icon: Receipt },
    { label: 'Salary Structures', path: '/payroll/salary', icon: DollarSign },
  ],
  employee: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'My Leaves', path: '/leaves', icon: CalendarOff },
    { label: 'Directory', path: '/directory', icon: BookUser },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const menuItems = roleMenus[user?.role] || [];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col z-40"
      style={{
        background: 'rgba(11, 19, 38, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">EmPay HRMS</h1>
          <p className="text-[0.65rem] text-on-surface-variant tracking-widest uppercase">Enterprise Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'active' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', color: 'white' }}>
            {getInitials(user?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{user?.full_name}</p>
            <p className="text-[0.65rem] text-on-surface-variant truncate capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant hover:text-error transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
