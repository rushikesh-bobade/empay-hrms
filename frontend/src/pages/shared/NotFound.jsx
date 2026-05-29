import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Home, AlertTriangle, Sun, Moon } from 'lucide-react';

export default function NotFound() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isDark = resolvedTheme === 'dark';

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/redirect' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface">

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl transition-all hover:scale-110"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
      </button>

      {/* Background orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(77,142,255,0.25) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-30 animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(87,27,193,0.3) 0%, transparent 70%)', animationDelay: '1s' }} />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Card */}
      <div className="w-full max-w-sm relative z-10 px-4 text-center">
        <div className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)'
          }}>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', boxShadow: '0 0 24px rgba(77,142,255,0.3)' }}>
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>

          {/* 404 */}
          <h1 className="text-7xl font-extrabold mb-2"
            style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </h1>

          <h2 className="text-lg font-bold text-on-surface mb-2">Page Not Found</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Button */}
          <button onClick={handleGoHome}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', boxShadow: '0 4px 16px rgba(77,142,255,0.25)' }}>
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>
        <p className="text-center text-[0.6rem] mt-4 text-outline-variant">© 2026 EmPay HRMS · Simplifying HR & Payroll</p>
      </div>
    </div>
  );
}