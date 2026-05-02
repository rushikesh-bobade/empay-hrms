import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  Calendar,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user, getRoleRedirect } = useAuth();
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user.role));
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center animate-fadeIn">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            E
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EmPay HRMS</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleActionClick}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center gap-2"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-slideIn">
          <Zap className="w-4 h-4" />
          <span>The Future of HR Management</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          Streamline your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400 animate-pulse-glow">
            workforce operations
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          An all-in-one platform for payroll, leave management, directory, and employee self-service. Built for modern teams who demand excellence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <button
            onClick={handleActionClick}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1"
          >
            {isAuthenticated ? 'Enter Dashboard' : 'Get Started Now'}
          </button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to manage your team</h2>
          <p className="text-muted-foreground">Powerful features designed to save you time and money.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="glass-card p-6 rounded-2xl transition-transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(6,182,212,0.1)] group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Employee Directory</h3>
            <p className="text-muted-foreground text-sm">Centralized database for all employee records, documents, and hierarchical structures.</p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-6 rounded-2xl transition-transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(79,70,229,0.1)] group">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Automated Payroll</h3>
            <p className="text-muted-foreground text-sm">Seamless payruns, tax calculations, and one-click payslip generation for your workforce.</p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-6 rounded-2xl transition-transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(34,197,94,0.1)] group">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Leave Management</h3>
            <p className="text-muted-foreground text-sm">Customizable leave policies, approval workflows, and real-time balance tracking.</p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card p-6 rounded-2xl transition-transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)] group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Self-Service Portal</h3>
            <p className="text-muted-foreground text-sm">Empower employees to view payslips, request time off, and manage their own profiles.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card-blue p-6 rounded-2xl text-center">
            <div className="text-3xl font-bold text-white mb-1">99.9%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</div>
          </div>
          <div className="stat-card-purple p-6 rounded-2xl text-center">
            <div className="text-3xl font-bold text-white mb-1">10k+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Employees Managed</div>
          </div>
          <div className="stat-card-cyan p-6 rounded-2xl text-center">
            <div className="text-3xl font-bold text-white mb-1">Zero</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Payroll Errors</div>
          </div>
          <div className="stat-card-green p-6 rounded-2xl text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Enterprise Security</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              E
            </div>
            <span className="text-sm font-medium text-muted-foreground">© 2026 EmPay HRMS. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Globe className="w-4 h-4" /> EN
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
