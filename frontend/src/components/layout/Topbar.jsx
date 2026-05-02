import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Settings, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Topbar() {
  const { user } = useAuth();
  const { isDark, setPreference } = useTheme();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const profilePicUrl = user?.profile_pic ? `${SERVER_URL}${user.profile_pic}` : null;

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 transition-colors duration-300"
      style={{
        background: 'var(--t-topbar-bg)',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px 0 var(--t-topbar-shadow)`,
        borderBottom: '1px solid var(--t-divider)',
      }}>
      {/* Left spacer */}
      <div />

      {/* Center brand */}
      <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
        EmPay
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setPreference(isDark ? 'light' : 'dark')}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ color: 'var(--t-text-secondary)' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          style={{ color: 'var(--t-text-secondary)' }}>
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full pulse-dot" style={{ border: '2px solid var(--t-surface)' }} />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          style={{ color: 'var(--t-text-secondary)' }}
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
        <div className="h-8 w-px mx-1" style={{ background: 'var(--t-divider)' }} />
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 p-1 pr-3 rounded-full transition-all duration-300"
        >
          {profilePicUrl ? (
            <img src={profilePicUrl} alt={user?.full_name} className="w-8 h-8 rounded-full object-cover" style={{ border: '1px solid var(--t-divider)' }} />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white', border: '1px solid var(--t-divider)' }}>
              {getInitials(user?.full_name)}
            </div>
          )}
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--t-on-surface)' }}>{user?.role?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}</span>
        </button>
      </div>
    </header>
  );
}
