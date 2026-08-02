import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { CheckSquare, PlayCircle, Banknote, Users, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PayrollDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/dashboard/payroll').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/payroll/payrun/generate', genForm);
      toast.success(`Payrun generated! ${res.data.data.payslips_generated_count} payslips created.`);
      setShowGen(false);
      api.get('/dashboard/payroll').then(res => setData(res.data.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setGenerating(false);
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return <div className="space-y-6"><PageHeader title="Payroll Dashboard" /><div className="grid grid-cols-4 gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-32 rounded-2xl"/>)}</div></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll Dashboard" subtitle="Overview and management of corporate payruns.">
        <button onClick={() => setShowGen(true)} className="btn-glow flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
          <PlayCircle className="w-4 h-4" /> Generate Payrun
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Payroll Cost" value={`₹${((data?.total_payroll_cost_this_month || 0) / 1000).toFixed(0)}K`} icon={Banknote} color="primary" />
        <StatCard title="Employees Count" value={data?.employees_count || 0} icon={Users} color="success" />
        <StatCard title="Pending Approvals" value={data?.pending_leave_approvals || 0} icon={CheckSquare} color="danger" />
        <StatCard title="Current Payrun" value={data?.this_month_payrun?.status || 'None'} icon={PlayCircle} color="cyan" subtitle={data?.this_month_payrun ? 'This month' : 'Not generated'} />
      </div>

      {/* Recent payruns */}
      <div className="glass-card p-5 fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-on-surface">Recent Payruns</h3>
        </div>
        <table className="w-full glass-table">
          <thead><tr><th>Month</th><th>Status</th><th>Total Amount</th><th>Employees</th></tr></thead>
          <tbody>
            {(data?.recent_payruns || []).map(p => (
              <tr key={p.id}>
                <td className="font-medium text-on-surface">{months[p.month - 1]} {p.year}</td>
                <td><span className={`chip-${p.status} inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize`}>{p.status}</span></td>
                <td className="text-primary font-semibold">₹{parseFloat(p.total_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td>{p.employee_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowGen(false)}>
          <div className="glass-card-strong w-full max-w-sm p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Generate Payrun</h2>
              <button onClick={() => setShowGen(false)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)]"><X className="w-4 h-4 text-on-surface-variant" /></button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Month</label>
                <select value={genForm.month} onChange={e => setGenForm(f => ({ ...f, month: parseInt(e.target.value, 10) }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl">
                  {(months ?? []).map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Year</label>
                <input type="number" value={genForm.year} onChange={e => setGenForm(f => ({ ...f, year: parseInt(e.target.value, 10) }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" />
              </div>
              <button type="submit" disabled={generating} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
