import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Building2, Loader2, Shield, Users, Clock, Wallet, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

const roleRedirects = {
  admin: '/admin/dashboard',
  hr_officer: '/hr/dashboard',
  payroll_officer: '/payroll/dashboard',
  employee: '/dashboard',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate(roleRedirects[user.role] || '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const autoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'Password@123');
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate(roleRedirects[user.role] || '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const demoUsers = [
    { label: 'Admin', email: 'admin@empay.com', icon: Shield },
    { label: 'HR Officer', email: 'hr@empay.com', icon: Users },
    { label: 'Payroll', email: 'payroll@empay.com', icon: Wallet },
    { label: 'Employee', email: 'sneha@empay.com', icon: Clock },
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface">
      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl transition-all hover:scale-110"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
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

      {/* Card — max-w-sm keeps it compact */}
      <div className="w-full max-w-sm relative z-10 px-4">
        <div className="rounded-2xl p-6 backdrop-blur-xl fade-in"
          style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)' }}>

          {/* Logo — compact */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', boxShadow: '0 0 24px rgba(77,142,255,0.3)' }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">EmPay HRMS</h1>
            <p className="text-xs mt-0.5 text-on-surface-variant">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-semibold mb-1.5 text-on-surface-variant">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all focus:ring-1 focus:ring-blue-500/40"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--color-on-surface)' }} placeholder="you@empay.com" required id="login-email" />
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-semibold mb-1.5 text-on-surface-variant">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg outline-none transition-all focus:ring-1 focus:ring-blue-500/40"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--color-on-surface)' }} placeholder="••••••••" required id="login-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-[0.65rem] font-medium hover:underline" style={{ color: '#6b9aff' }}>Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" disabled={loading} id="login-submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', boxShadow: '0 4px 16px rgba(77,142,255,0.25)' }}>
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</span> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
            <span className="text-[0.6rem] uppercase tracking-widest font-semibold text-outline">Demo Access</span>
            <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
          </div>

          {/* Demo buttons — 2x2 compact grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {demoUsers.map(r => (
              <button key={r.email} onClick={() => autoLogin(r.email)} disabled={loading}
                className="px-2.5 py-2 rounded-lg text-xs transition-all flex items-center gap-2 disabled:opacity-50"
                style={{ border: '1px solid var(--glass-border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(77,142,255,0.3)'; e.currentTarget.style.background = isDark ? 'rgba(77,142,255,0.08)' : 'rgba(77,142,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'transparent'; }}>
                <r.icon className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                <div className="min-w-0">
                  <span className="font-semibold block text-[0.7rem] text-on-surface">{r.label}</span>
                  <span className="text-[0.55rem] block truncate text-on-surface-variant">{r.email}</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[0.55rem] mt-3 text-center text-on-surface-variant">
            Password: <span className="font-semibold tracking-wider text-on-surface">Password@123</span>
          </p>
        </div>

        <p className="text-center text-[0.6rem] mt-4 text-outline-variant">© 2026 EmPay HRMS · Simplifying HR & Payroll</p>
      </div>
    </div>
  );
}
