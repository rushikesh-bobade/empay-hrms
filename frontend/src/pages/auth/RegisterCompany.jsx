import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Loader2, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

export default function RegisterCompany() {
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register-company', formData);
      setSuccess(true);
      toast.success('Company registered successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="glass-card-strong w-full max-w-md p-10 fade-in rounded-3xl text-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Registration Successful!</h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Your company <strong>{formData.company_name}</strong> has been registered. 
            You can now sign in using your admin credentials.
          </p>
          <Link to="/login" className="btn-glow w-full inline-block py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="glass-card-strong w-full max-w-md p-8 fade-in rounded-3xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-primary">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Join EmPay HRMS</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">Register your company to start managing HR & Payroll</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                value={formData.company_name} 
                onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                className="input-glass w-full pl-10 pr-4 py-3 text-sm rounded-xl" 
                placeholder="Acme Corp" 
                required 
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 mt-4">
            <p className="text-[0.65rem] uppercase tracking-widest font-bold text-primary mb-4">Admin Account Details</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                    className="input-glass w-full pl-10 pr-4 py-3 text-sm rounded-xl" 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="input-glass w-full pl-10 pr-4 py-3 text-sm rounded-xl" 
                    placeholder="admin@acme.com" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="input-glass w-full pl-10 pr-4 py-3 text-sm rounded-xl" 
                    placeholder="********" 
                    required 
                    minLength={8}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-glow w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 bg-gradient-primary mt-6"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Registering...</span> : 'Create Company Account'}
          </button>
        </form>

        <p className="text-center text-xs mt-8 text-muted-foreground">
          Already registered? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>

        <p className="text-center text-[0.6rem] mt-6 text-outline-variant">© 2026 EmPay HRMS · Simplifying HR & Payroll</p>
      </div>
    </div>
  );
}
