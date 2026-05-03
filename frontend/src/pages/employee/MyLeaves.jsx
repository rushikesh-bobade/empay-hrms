import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MyLeaves() {
  const [tab, setTab] = useState('balance');
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('yearly');

  const fetchData = () => {
    Promise.all([api.get('/leave/allocation/my'), api.get('/leave/requests/my'), api.get('/leave/types')])
      .then(([aRes, rRes, tRes]) => { setAllocations(aRes.data.data); setRequests(rRes.data.data); setLeaveTypes(tRes.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const calcDays = () => {
    if (!form.start_date || !form.end_date) return 0;
    let count = 0;
    const cur = new Date(form.start_date);
    const end = new Date(form.end_date);
    while (cur <= end) { const d = cur.getDay(); if (d !== 0 && d !== 6) count++; cur.setDate(cur.getDate() + 1); }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post('/leave/request', form);
      toast.success('Leave request submitted'); setShowApply(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const colors = { 'Casual Leave': '#4d8eff', 'Sick/Medical Leave': '#f87171', 'Earned/Privilege Leave': '#4cd7f6' };

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle="Track and manage your time off.">
        <button onClick={() => { setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' }); setShowApply(true); }}
          className="btn-glow flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </PageHeader>

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--glass-bg)' }}>
        {[{ key: 'balance', label: 'My Leave Balance' }, { key: 'history', label: 'Apply & History' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'balance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--glass-bg)] border border-surface">
              <button onClick={() => setViewMode('yearly')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'yearly' ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:bg-surface'}`}>Yearly View</button>
              <button onClick={() => setViewMode('monthly')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:bg-surface'}`}>Monthly View</button>
            </div>
            <p className="text-[11px] text-on-surface-variant italic">
              {viewMode === 'yearly' ? 'Showing total allocations for ' + new Date().getFullYear() : 'Showing monthly breakdown and current month usage'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allocations.filter(a => a.allocated_days > 0).map(a => {
              const isMonthly = viewMode === 'monthly';
              const allocated = isMonthly ? parseFloat((a.allocated_days / 12).toFixed(1)) : a.allocated_days;
              const used = isMonthly ? (a.used_this_month || 0) : a.used_days;
              const remaining = isMonthly ? parseFloat((allocated - used).toFixed(1)) : a.remaining;
              const pct = allocated > 0 ? (used / allocated * 100) : 0;
              
              return (
                <div key={a.id} className="glass-panel rounded-2xl p-5 fade-in relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-12 h-12 rounded-full border-4 border-primary" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant">{a.name}</p>
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(77,142,255,0.5)]" style={{ background: colors[a.name] || '#4d8eff' }} />
                  </div>
                  <p className="text-3xl font-bold text-on-surface mb-1">
                    {remaining} <span className="text-lg text-on-surface-variant font-normal">days {remaining < 0 ? 'extra' : 'left'}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mb-4">
                    {isMonthly ? 'Monthly Quota' : 'Annual Allocation'}: {allocated} · Used: {used}
                  </p>
                  <div className="progress-bar bg-surface-variant/20 h-1.5">
                    <div className="progress-bar-fill shadow-[0_0_10px_rgba(77,142,255,0.3)] transition-all duration-500" style={{ width: `${Math.min(Math.max(0, pct), 100)}%`, background: colors[a.name] || '#4d8eff' }} />
                  </div>
                  {isMonthly && used > allocated && (
                    <p className="text-[10px] text-red-400 mt-2 font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-400" /> Over-limit this month
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {allocations.some(a => a.used_days > a.allocated_days) && (
            <div className="glass-panel rounded-2xl p-5 fade-in border border-red-500/30" style={{ background: 'rgba(248, 113, 113, 0.05)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-400">
                  <X className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-red-400">Extra Leaves & Deductions</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">
                You have exceeded your allocated leave limit. Extra leaves taken will result in a proportional salary deduction at the end of the month.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allocations.filter(a => a.used_days > a.allocated_days).map(a => (
                  <div key={'extra-'+a.id} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">{a.name}</p>
                    <p className="text-2xl font-bold text-red-400">
                      +{a.used_days - a.allocated_days} <span className="text-sm font-normal text-on-surface-variant">extra days</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-panel rounded-2xl overflow-hidden fade-in">
          <table className="w-full glass-table">
            <thead><tr><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied On</th></tr></thead>
            <tbody>
              {loading ? Array.from({length:3}).map((_,i) => <tr key={i}>{Array.from({length:7}).map((_,j)=><td key={j}><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>) :
              requests.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant">No leave requests yet</td></tr> :
              requests.map(r => (
                <tr key={r.id}>
                  <td className="font-medium text-on-surface">{r.leave_type_name}</td>
                  <td>{new Date(r.start_date).toLocaleDateString()}</td>
                  <td>{new Date(r.end_date).toLocaleDateString()}</td>
                  <td>{r.total_days}</td>
                  <td className="text-on-surface-variant max-w-[150px] truncate">{r.reason || '—'}</td>
                  <td><span className={`chip-${r.status} inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize`}>{r.status}</span></td>
                  <td className="text-on-surface-variant">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowApply(false)}>
          <div className="glass-panel-elevated w-full max-w-md p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Apply for Leave</h2>
              <button onClick={() => setShowApply(false)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)]"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Leave Type</label>
                <select value={form.leave_type_id} onChange={e => setForm(f => ({...f, leave_type_id: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required>
                  <option value="">Select type...</option>
                  {leaveTypes.filter(lt => allocations.some(a => a.leave_type_id === lt.id && a.allocated_days > 0)).map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required /></div>
                <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required /></div>
              </div>
              {form.start_date && form.end_date && (
                <p className="text-sm text-primary font-medium">Total Days: {calcDays()}</p>
              )}
              <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Reason</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl h-20 resize-none" placeholder="Briefly describe your reason..." /></div>
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
