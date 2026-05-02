import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, FileText, Banknote, Building2, Shield, BarChart3, Clock, Users, CalendarCheck, Zap, Mail, Phone, MapPin, ArrowRight, Star } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) return <Navigate to="/redirect" replace />;

  const features = [
    { icon: Clock, title: 'Smart Attendance', desc: 'Real-time check-in/out with GPS tracking, monthly calendar grids, and precise hour calculations.', color: '#10b981', bg: '#ecfdf5', border: '#d1fae5' },
    { icon: CalendarCheck, title: 'Leave Management', desc: 'Custom leave types, automated balance tracking, multi-level approval workflows, and policy compliance.', color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
    { icon: Banknote, title: 'Payroll Engine', desc: '12-step salary calculation with HRA, PF, tax deductions, one-click payruns, and PDF payslip generation.', color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Granular permissions for Admin, HR, Payroll Officers, and Employees with JWT-secured sessions.', color: '#8b5cf6', bg: '#f5f3ff', border: '#ede9fe' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Interactive Recharts-powered graphs with Bento-grid layouts showing real-time organizational insights.', color: '#06b6d4', bg: '#ecfeff', border: '#cffafe' },
    { icon: Users, title: 'Employee Directory', desc: 'Centralized employee profiles with department filtering, contact information, and organizational hierarchy.', color: '#ec4899', bg: '#fdf2f8', border: '#fce7f3' },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '50K+', label: 'Employees Managed' },
    { value: '12-Step', label: 'Payroll Engine' },
    { value: '4', label: 'Role Levels' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col landing-page" style={{ scrollBehavior: 'smooth' }}>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5b4bd4]">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">EmPay</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#hero" className="text-[#5b4bd4] hover:text-[#4a3bc0] transition-colors">Home</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-lg text-sm font-bold text-[#5b4bd4] border-2 border-[#5b4bd4]/20 hover:bg-[#5b4bd4]/5 transition-colors">Login</Link>
            <Link to="/login" className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#5b4bd4] shadow-lg shadow-[#5b4bd4]/25 hover:bg-[#4a3bc0] transition-colors">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section id="hero" className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between py-16 gap-12">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5b4bd4]/10 border border-[#5b4bd4]/20 mb-6">
            <Zap className="w-3.5 h-3.5 text-[#5b4bd4]" />
            <span className="text-xs font-bold text-[#5b4bd4]">Trusted by 500+ Organizations</span>
          </div>
          <h1 className="text-5xl md:text-[3.5rem] font-extrabold text-[#1e293b] leading-[1.12] mb-6 tracking-tight">
            Smart HR Management,<br /><span className="text-[#5b4bd4]">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-md">
            EmPay is a smart HRMS platform that automates <strong className="text-slate-700">Attendance</strong>, <strong className="text-slate-700">Leave Management</strong>, and <strong className="text-slate-700">Payroll</strong> to help organizations work efficiently.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="group px-8 py-3.5 rounded-xl text-base font-bold text-white bg-[#5b4bd4] shadow-xl shadow-[#5b4bd4]/25 hover:bg-[#4a3bc0] transition-all hover:-translate-y-0.5 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl text-base font-bold text-[#5b4bd4] border-2 border-[#5b4bd4]/20 hover:bg-[#5b4bd4]/5 transition-colors">Sign Up</Link>
          </div>
        </div>
        <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
          <img src="/illustration.png" alt="HR Platform" className="w-[82%] z-10" />
          <div className="absolute top-[12%] left-[-8%] z-20 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/60 border border-slate-100 min-w-[140px]" style={{ animation: 'float 4s ease-in-out infinite' }}>
            <p className="text-[0.7rem] font-extrabold text-slate-700 mb-2">Attendance</p>
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /></div><span className="text-sm font-extrabold text-green-600">Present</span></div>
          </div>
          <div className="absolute top-[2%] right-[-4%] z-20 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/60 border border-slate-100 min-w-[110px]" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}>
            <p className="text-[0.7rem] font-extrabold text-slate-700 mb-1">Leave</p>
            <p className="text-3xl font-extrabold text-slate-900 leading-tight">12</p>
            <p className="text-[0.7rem] font-extrabold text-orange-500">Pending</p>
          </div>
          <div className="absolute bottom-[18%] right-[-8%] z-20 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/60 border border-slate-100 min-w-[150px]" style={{ animation: 'float 6s ease-in-out infinite 1s' }}>
            <p className="text-[0.7rem] font-extrabold text-slate-700 mb-1">Payroll</p>
            <p className="text-xl font-extrabold text-green-600">₹ 24,500</p>
            <p className="text-[0.65rem] font-bold text-slate-400">This Month</p>
          </div>
        </div>
      </section>

      {/* ─── Quick Features Row ─── */}
      <section className="max-w-7xl mx-auto px-6 w-full pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: FileText, title: 'Attendance', desc: 'Track attendance in real-time', color: 'green' },
            { icon: FileText, title: 'Leave Management', desc: 'Apply and manage leaves easily', color: 'orange' },
            { icon: Banknote, title: 'Payroll', desc: 'Automate payroll and payslips', color: 'blue' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
              <div className={`w-12 h-12 rounded-xl bg-${f.color}-50 border border-${f.color}-100 flex items-center justify-center shrink-0`}>
                <f.icon className={`w-5 h-5 text-${f.color}-600`} />
              </div>
              <div><h3 className="text-sm font-extrabold text-slate-900">{f.title}</h3><p className="text-xs text-slate-500 font-medium">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="bg-[#f8f9fc] py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#5b4bd4]/10 text-xs font-bold text-[#5b4bd4] uppercase tracking-widest mb-4">Features</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Everything You Need to Scale</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Powerful modules perfectly integrated to streamline your human resource operations from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-default">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                    <Icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-[#5b4bd4] py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#5b4bd4]/10 text-xs font-bold text-[#5b4bd4] uppercase tracking-widest mb-4">About Us</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Built for Modern Organizations</h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-6">EmPay was engineered to eliminate the friction between human resources and complex financial calculations. We believe that managing your workforce should be effortless, accurate, and secure.</p>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">Our platform combines cutting-edge technologies — React, Node.js, PostgreSQL, and PDFKit — to deliver a solution that scales from 10 employees to 10,000+, all while maintaining sub-second response times and bank-grade security.</p>
            <div className="space-y-3">
              {['End-to-end encrypted JWT authentication', 'Automated 12-step payroll calculation', 'Real-time attendance with calendar grids', 'One-click PDF payslip generation'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /></div>
                  <span className="text-sm font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-[#f8f9fc] rounded-2xl p-6 text-center border border-slate-100">
                <p className="text-3xl font-extrabold text-[#5b4bd4] mb-1">{s.value}</p>
                <p className="text-xs font-bold text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className="py-24 bg-[#f8f9fc] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#5b4bd4]/10 text-xs font-bold text-[#5b4bd4] uppercase tracking-widest mb-4">Contact</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Have questions about integrating EmPay into your organization? Our team is here to help you get started.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Mail, title: 'Email Us', detail: 'support@empay.com', href: 'mailto:support@empay.com' },
              { icon: Phone, title: 'Call Us', detail: '+91 98765 43210', href: 'tel:+919876543210' },
              { icon: MapPin, title: 'Visit Us', detail: 'Mumbai, Maharashtra, India', href: '#' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <a key={i} href={c.href} className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group block">
                  <div className="w-14 h-14 rounded-2xl bg-[#5b4bd4]/10 border border-[#5b4bd4]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#5b4bd4] transition-colors">
                    <Icon className="w-6 h-6 text-[#5b4bd4] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{c.detail}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5b4bd4]"><Building2 className="w-4 h-4 text-white" /></div>
            <span className="text-base font-extrabold text-white">EmPay HRMS</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} EmPay HRMS. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
