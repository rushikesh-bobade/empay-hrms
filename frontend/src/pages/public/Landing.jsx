import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, FileText, Banknote, Building2 } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/redirect" replace />;
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans text-slate-800 flex flex-col landing-page">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5b4bd4]">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">EmPay</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-500">
          <a href="#" className="text-[#5b4bd4]">Home</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#5b4bd4] border-2 border-[#5b4bd4]/20 hover:bg-[#5b4bd4]/5 transition-colors">
            Login
          </Link>
          <Link to="/login" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#5b4bd4] shadow-lg shadow-[#5b4bd4]/30 hover:bg-[#4a3bc0] transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between py-12 gap-12">
        
        {/* Left Content */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-[3.5rem] font-extrabold text-[#1e293b] leading-[1.15] mb-6 tracking-tight">
            Smart HR Management,<br />
            <span className="text-[#5b4bd4]">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-md font-medium">
            EmPay is a smart HRMS platform that automates Attendance, Leave Management, and Payroll to help organizations work efficiently.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-10 py-3.5 rounded-xl text-base font-bold text-white bg-[#5b4bd4] shadow-xl shadow-[#5b4bd4]/30 hover:bg-[#4a3bc0] transition-transform hover:-translate-y-0.5">
              Login
            </Link>
            <Link to="/login" className="px-10 py-3.5 rounded-xl text-base font-bold text-[#5b4bd4] border-2 border-[#5b4bd4]/20 hover:bg-[#5b4bd4]/5 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Right Content - Illustration & Floating Widgets */}
        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
          {/* Main Illustration */}
          <img src="/illustration.png" alt="HR Platform Illustration" className="w-[85%] z-10" />

          {/* Floating Widget 1: Attendance */}
          <div className="absolute top-[15%] left-[-10%] z-20 bg-white rounded-[1.25rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-50 min-w-[140px] animate-[bounce_4s_infinite]">
            <p className="text-[0.7rem] font-extrabold text-slate-800 mb-2">Attendance</p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-sm font-extrabold text-green-600">Present</span>
            </div>
          </div>

          {/* Floating Widget 2: Leave */}
          <div className="absolute top-[5%] right-[-5%] z-20 bg-white rounded-[1.25rem] p-5 shadow-xl shadow-slate-200/50 border border-slate-50 min-w-[120px] animate-[bounce_5s_infinite]">
            <p className="text-[0.7rem] font-extrabold text-slate-800 mb-1">Leave</p>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">12</p>
            <p className="text-[0.7rem] font-extrabold text-orange-500">Pending</p>
          </div>

          {/* Floating Widget 3: Payroll */}
          <div className="absolute bottom-[20%] right-[-10%] z-20 bg-white rounded-[1.25rem] p-5 shadow-xl shadow-slate-200/50 border border-slate-50 min-w-[160px] animate-[bounce_6s_infinite]">
            <p className="text-[0.7rem] font-extrabold text-slate-800 mb-2">Payroll</p>
            <p className="text-[1.35rem] font-extrabold text-green-600 mb-1">₹ 24,500</p>
            <p className="text-[0.65rem] font-bold text-slate-400">This Month</p>
          </div>
        </div>
      </main>

      {/* Bottom Features Row */}
      <section className="max-w-7xl mx-auto px-6 w-full pb-16 z-10 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-[3.25rem] h-[3.25rem] rounded-[1rem] bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-[0.95rem] font-extrabold text-slate-900 mb-0.5">Attendance</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">Track attendance<br/>in real-time</p>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-[3.25rem] h-[3.25rem] rounded-[1rem] bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-[0.95rem] font-extrabold text-slate-900 mb-0.5">Leave Management</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">Apply and manage<br/>leaves easily</p>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-[3.25rem] h-[3.25rem] rounded-[1rem] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[0.95rem] font-extrabold text-slate-900 mb-0.5">Payroll</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">Automate payroll<br/>and payslips</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
