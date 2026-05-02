import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import UserAvatar from '../shared/UserAvatar';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarOff, Banknote,
  Settings, UserPlus, CheckSquare, Receipt, DollarSign,
  BookUser, FileText, LogOut, Building2, ChevronsLeft, ChevronsRight
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
    { label: 'My Payslips', path: '/payslips', icon: Receipt },
    { label: 'Directory', path: '/directory', icon: BookUser },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { collapsed, toggle } = useSidebar();
  const menuItems = roleMenus[user?.role] || [];

  return (
    <aside
      className={`h-screen fixed left-0 top-0 flex flex-col z-40 transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-64'}`}
      style={{
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--sidebar-border)',
      }}>

      {/* Brand + Toggle */}
      <div className={`flex items-center ${collapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? '' : ''}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-on-surface tracking-tight whitespace-nowrap">EmPay HRMS</h1>
              <p className="text-[0.65rem] text-on-surface-variant tracking-widest uppercase">Enterprise Portal</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center pb-2">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-on-surface-variant hover:text-on-surface transition-colors"
            title="Expand sidebar"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-2 space-y-1 overflow-y-auto`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`sidebar-link group relative flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'active' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50"
                  style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)', color: 'var(--text-on-surface)' }}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`${collapsed ? 'p-2' : 'p-4'}`} style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <UserAvatar user={user} size="sm" />
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-on-surface-variant hover:text-error transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{user?.full_name}</p>
              <p className="text-[0.65rem] text-on-surface-variant truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-on-surface-variant hover:text-error transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
