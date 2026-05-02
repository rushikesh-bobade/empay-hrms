import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import { Plus, X } from 'lucide-react';

export default function MyLeaves() {
  const [tab, setTab] = useState('balance');
  const [balance, setBalance] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leave_type_id:'', start_date:'', end_date:'', reason:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/leave/allocation/my'),
      api.get('/leave/requests/my'),
      api.get('/leave/types'),
    ]).then(([bRes, rRes, tRes]) => {
      setBalance(bRes.data.data);
      setRequests(rRes.data.data);
      setLeaveTypes(tRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const calcDays = () => {
    if (!form.start_date || !form.end_date) return 0;
    let count = 0;
    const s = new Date(form.start_date), e = new Date(form.end_date), c = new Date(s);
    while (c <= e) {
      const d = c.getDay();
      if (d !== 0 && d !== 6) count++;
      c.setDate(c.getDate()+1);
    }
    return count;
  };

  const handleApply = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/leave/request', form);
      setShowApply(false);
      setForm({ leave_type_id:'', start_date:'', end_date:'', reason:'' });
      const [bRes, rRes] = await Promise.all([api.get('/leave/allocation/my'), api.get('/leave/requests/my')]);
      setBalance(bRes.data.data); setRequests(rRes.data.data);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="My Leaves" subtitle="Leave balance and history">
        <button onClick={()=>setShowApply(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4"/>Apply for Leave</button>
      </PageHeader>

      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 w-fit">
        {['balance','history'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${tab===t?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`}>{t==='balance'?'My Leave Balance':'Apply & History'}</button>
        ))}
      </div>

      {tab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {balance.map(b => {
            const remaining = b.allocated_days - b.used_days;
            const pct = b.allocated_days > 0 ? (b.used_days/b.allocated_days)*100 : 0;
            return (
              <div key={b.leave_type_id} className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-3">{b.leave_type_name}</h3>
                <div className="flex items-end justify-between mb-3">
                  <div><p className="text-3xl font-bold text-white">{remaining}</p><p className="text-xs text-slate-500">remaining</p></div>
                  <div className="text-right"><p className="text-sm text-slate-400">{b.allocated_days} allocated</p><p className="text-sm text-slate-400">{b.used_days} used</p></div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct>80?'bg-red-500':pct>50?'bg-amber-500':'bg-indigo-500'}`} style={{width:`${pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Start</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">End</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Days</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Reason</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Applied</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800/50">
              {requests.map(r=>(
                <tr key={r.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-sm text-white">{r.leave_type_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{new Date(r.start_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{new Date(r.end_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{r.total_days}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 truncate max-w-[150px]">{r.reason}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Apply for Leave</h2>
              <button onClick={()=>{setShowApply(false);setError('');}} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleApply} className="space-y-4">
              <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Leave Type</label>
                <select value={form.leave_type_id} onChange={e=>setForm({...form,leave_type_id:e.target.value})} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="">Select</option>{leaveTypes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"/></div>
                <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">End Date</label>
                  <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"/></div>
              </div>
              {form.start_date && form.end_date && <p className="text-sm text-indigo-400">Total Days: {calcDays()}</p>}
              <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Reason</label>
                <textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={3} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"/></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={()=>{setShowApply(false);setError('');}} className="px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving?'Submitting...':'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
