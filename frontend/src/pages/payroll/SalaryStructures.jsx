import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { DollarSign, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '../../context/SocketContext';
import SearchableSelect from '../../components/shared/SearchableSelect';

export default function SalaryStructures() {
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ employee_id: '', basic_salary: '', hra_percent: 40, special_allowance: 0, effective_from: '' });
  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  const fetchStructures = useCallback(() => {
    Promise.all([api.get('/payroll/salary-structure'), api.get('/users')])
      .then(([ssRes, uRes]) => { setStructures(ssRes.data.data); setEmployees(uRes.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStructures(); }, [fetchStructures]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchStructures();
    socket.on('salary_updated', handleUpdate);
    return () => socket.off('salary_updated', handleUpdate);
  }, [socket, fetchStructures]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) return toast.error('Please select an employee');
    setSubmitting(true);
    try {
      await api.post('/payroll/salary-structure', form);
      toast.success('Salary structure saved'); setShowDialog(false); fetchStructures();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const openEdit = (s) => {
    setForm({ employee_id: s.employee_id, basic_salary: s.basic_salary, hra_percent: s.hra_percent, special_allowance: s.special_allowance, effective_from: s.effective_from?.split('T')[0] || '' });
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Salary Structures" subtitle="Manage employee compensation.">
        <button onClick={() => { setForm({ employee_id: '', basic_salary: '', hra_percent: 40, special_allowance: 0, effective_from: '' }); setShowDialog(true); }}
          className="btn-glow flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
          <DollarSign className="w-4 h-4" /> Set Salary
        </button>
      </PageHeader>

      <div className="glass-panel rounded-2xl overflow-hidden fade-in">
        <table className="w-full glass-table">
          <thead><tr><th>Employee</th><th>Department</th><th>Basic Salary</th><th>HRA %</th><th>Special Allow.</th><th>Effective From</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:7}).map((_,j)=><td key={j}><div className="skeleton h-4 w-20 rounded"/></td>)}</tr>) :
            structures.map(s => (
              <tr key={s.id}>
                <td className="font-medium text-on-surface">{s.full_name}</td>
                <td className="text-on-surface-variant">{s.department||'—'}</td>
                <td className="text-primary font-semibold">₹{parseFloat(s.basic_salary).toLocaleString()}</td>
                <td>{s.hra_percent}%</td>
                <td>₹{parseFloat(s.special_allowance).toLocaleString()}</td>
                <td>{s.effective_from ? new Date(s.effective_from).toLocaleDateString() : '—'}</td>
                <td><button onClick={() => openEdit(s)} className="px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDialog(false)}>
          <div className="glass-panel-elevated w-full max-w-md p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Set Salary Structure</h2>
              <button onClick={() => setShowDialog(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Employee</label>
                <SearchableSelect 
                  options={employees.map(e => ({ value: e.id, label: `${e.full_name} (${e.email})` }))}
                  value={form.employee_id}
                  onChange={val => setForm(f => ({...f, employee_id: val}))}
                  placeholder="Select Employee"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Basic Salary</label>
                  <input type="number" value={form.basic_salary} onChange={e => setForm(f => ({...f, basic_salary: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required /></div>
                <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">HRA %</label>
                  <input type="number" value={form.hra_percent} onChange={e => setForm(f => ({...f, hra_percent: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Special Allow.</label>
                  <input type="number" value={form.special_allowance} onChange={e => setForm(f => ({...f, special_allowance: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" /></div>
                <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Effective From</label>
                  <input type="date" value={form.effective_from} onChange={e => setForm(f => ({...f, effective_from: e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" /></div>
              </div>
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
