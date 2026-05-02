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

  if (loading) return <div className="space-y-6"><PageHeader title="Payroll Dashboard" /><div className="grid grid-cols-12 gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="col-span-3 skeleton h-36 rounded-2xl"/>)}</div></div>;

  return (
    <div className="space-y-5">
      <PageHeader title="Payroll Dashboard" subtitle="Overview and management of corporate payruns."
        action={
          <button onClick={() => setShowGen(true)} className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <PlayCircle className="w-4 h-4" /> Generate Payrun
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Total Payroll Cost" value={`₹${((data?.total_payroll_cost_this_month || 0) / 1000).toFixed(0)}K`} icon={Banknote} color="primary" /></div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Employees Count" value={data?.employees_count || 0} icon={Users} color="success" /></div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Pending Approvals" value={data?.pending_leave_approvals || 0} icon={CheckSquare} color="danger" /></div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Current Payrun" value={data?.this_month_payrun?.status || 'None'} icon={PlayCircle} color="cyan" subtitle={data?.this_month_payrun ? 'This month' : 'Not generated'} /></div>
      </div>

      {/* Recent payruns */}
      <div className="glass-panel rounded-2xl overflow-hidden fade-in">
        <div className="p-6 border-b border-white/5 flex items-center justify-between" style={{ background: 'rgba(23,31,51,0.3)', backdropFilter: 'blur(20px)' }}>
          <h3 className="text-2xl font-semibold" style={{ color: '#dae2fd' }}>Recent Payruns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] uppercase tracking-[0.05em] font-semibold" style={{ color: '#c2c6d6' }}>
                <th className="p-4 pl-6">Month</th><th className="p-4">Status</th><th className="p-4">Total Amount</th><th className="p-4 pr-6">Employees</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5" style={{ color: '#dae2fd' }}>
              {(data?.recent_payruns || []).map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-medium">{months[p.month - 1]} {p.year}</td>
                  <td className="p-4"><span className={`chip-${p.status} inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize`}>{p.status}</span></td>
                  <td className="p-4 font-semibold" style={{ color: '#adc6ff' }}>₹{parseFloat(p.total_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="p-4 pr-6">{p.employee_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowGen(false)}>
          <div className="glass-panel-elevated w-full max-w-sm p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: '#dae2fd' }}>Generate Payrun</h2>
              <button onClick={() => setShowGen(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4" style={{ color: '#c2c6d6' }} /></button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-[0.05em] font-semibold mb-1.5" style={{ color: '#c2c6d6' }}>Month</label>
                <select value={genForm.month} onChange={e => setGenForm(f => ({ ...f, month: parseInt(e.target.value) }))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[0.7rem] uppercase tracking-[0.05em] font-semibold mb-1.5" style={{ color: '#c2c6d6' }}>Year</label>
                <input type="number" value={genForm.year} onChange={e => setGenForm(f => ({ ...f, year: parseInt(e.target.value) }))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" />
              </div>
              <button type="submit" disabled={generating} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
