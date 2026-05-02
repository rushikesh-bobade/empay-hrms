import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarOff, Banknote,
  Settings, UserPlus, CheckSquare, Receipt, DollarSign,
  BookUser, FileText, LogOut, Building2
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const roleMenus = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/admin/users', icon: Users },
    { label: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { label: 'Leaves', path: '/hr/leaves', icon: CalendarOff },
    { label: 'Payroll', path: '/payroll/payruns', icon: Banknote },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  hr_officer: [
    { label: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/hr/employees', icon: UserPlus },
    { label: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { label: 'Leaves', path: '/hr/leaves', icon: CalendarOff },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  payroll_officer: [
    { label: 'Dashboard', path: '/payroll/dashboard', icon: LayoutDashboard },
    { label: 'Leave Approvals', path: '/payroll/leaves', icon: CheckSquare },
    { label: 'Payruns', path: '/payroll/payruns', icon: Receipt },
    { label: 'Salary Structures', path: '/payroll/salary', icon: DollarSign },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  employee: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'My Leaves', path: '/leaves', icon: CalendarOff },
    { label: 'My Payslips', path: '/payslips', icon: FileText },
    { label: 'Directory', path: '/directory', icon: BookUser },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const { isDark } = useTheme();
  const location = useLocation();
  const menuItems = roleMenus[user?.role] || [];
  const [spinning, setSpinning] = useState(false);

  const handleLogoClick = () => {
    setSpinning(true);
    toggle();
    setTimeout(() => setSpinning(false), 600);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const profilePicUrl = user?.profile_pic ? `${SERVER_URL}${user.profile_pic}` : null;

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50 inner-glow transition-all duration-300"
      style={{
        width: collapsed ? 72 : 280,
        background: 'var(--t-sidebar-bg)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--t-sidebar-border)',
      }}
    >
      {/* Brand */}
      <div className={`py-6 mb-4 flex items-center ${collapsed ? 'px-4 justify-center' : 'px-6 gap-4'}`}>
        <button
          onClick={handleLogoClick}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Building2 className="w-5 h-5 text-white" style={{ transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }} />
        </button>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-black tracking-widest whitespace-nowrap" style={{ color: 'var(--t-text-primary)' }}>EmPay HRMS</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--t-text-secondary)' }}>Enterprise Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 py-3.5 text-sm font-medium transition-all duration-200 rounded-xl ${
                collapsed ? 'justify-center px-0 mx-auto w-12' : 'px-5'
              } ${
                isActive
                  ? 'border-r-2 border-blue-500'
                  : 'hover:bg-[var(--t-sidebar-hover-bg)]'
              }`}
              style={{
                background: isActive ? 'var(--t-sidebar-active-bg)' : undefined,
                color: isActive ? '#3b82f6' : 'var(--t-text-secondary)',
              }}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`py-4 ${collapsed ? 'px-3' : 'px-5'}`} style={{ borderTop: '1px solid var(--t-divider)' }}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {profilePicUrl ? (
            <img src={profilePicUrl} alt={user?.full_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" style={{ border: '1px solid var(--t-divider)' }} />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white' }}>
              {getInitials(user?.full_name)}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--t-text-primary)' }}>{user?.full_name}</p>
                <p className="text-[0.65rem] truncate capitalize" style={{ color: 'var(--t-text-secondary)' }}>{user?.role?.replace('_', ' ')}</p>
              </div>
              <button onClick={logout} className="p-2 rounded-full transition-all duration-300 hover:text-red-400" style={{ color: 'var(--t-text-secondary)' }} title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
