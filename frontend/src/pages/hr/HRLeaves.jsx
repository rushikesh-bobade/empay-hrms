import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { X, Loader2, Plus, Search, ChevronDown, FileX, CalendarX } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../components/shared/EmptyState';

// Reusable searchable employee picker
function EmployeeSearch({ employees, value, onChange, placeholder = 'Search employee by name...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = employees.find(e => e.id === value);
  const filtered = query.trim()
    ? employees.filter(e => e.full_name.toLowerCase().includes(query.toLowerCase()) || e.email.toLowerCase().includes(query.toLowerCase()))
    : employees;

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (emp) => {
    onChange(emp.id);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
        {selected && !open ? (
          <div className="input-glass w-full pl-9 pr-8 py-2.5 text-sm rounded-xl flex items-center justify-between cursor-pointer"
            onClick={() => setOpen(true)}>
            <span className="text-on-surface font-medium">{selected.full_name} <span className="text-on-surface-variant font-normal text-xs">({selected.email})</span></span>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="input-glass w-full pl-9 pr-8 py-2.5 text-sm rounded-xl"
          />
        )}
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl shadow-lg"
          style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-on-surface-variant text-center">No employees found</div>
          ) : (
            filtered.slice(0, 20).map(emp => (
              <button key={emp.id} type="button"
                onClick={() => handleSelect(emp)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-3 hover:bg-[var(--sidebar-hover)] ${value === emp.id ? 'bg-primary/10' : ''}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', color: 'white' }}>
                  {emp.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-on-surface font-medium truncate">{emp.full_name}</div>
                  <div className="text-[0.65rem] text-on-surface-variant truncate">{emp.email} · {emp.department || 'N/A'}</div>
                </div>
              </button>
            ))
          )}
          {filtered.length > 20 && (
            <div className="px-4 py-2 text-xs text-on-surface-variant text-center border-t" style={{ borderColor: 'var(--glass-border)' }}>
              Showing 20 of {filtered.length} — type to narrow results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HRLeaves() {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAllocDialog, setShowAllocDialog] = useState(false);
  const [allocForm, setAllocForm] = useState({ employee_id: '', leave_type_id: '', allocated_days: '', year: new Date().getFullYear() });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/leave/requests/all', { params: statusFilter ? { status: statusFilter } : {} }),
      api.get('/users'),
      api.get('/leave/types'),
    ]).then(([reqRes, usrRes, ltRes]) => {
      setRequests(reqRes.data.data);
      setEmployees(usrRes.data.data);
      setLeaveTypes(ltRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    if (selectedEmp) {
      api.get(`/leave/allocation/${selectedEmp}`).then(res => setAllocations(res.data.data)).catch(() => {});
    }
  }, [selectedEmp]);

  const handleAllocSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leave/allocation', allocForm);
      toast.success('Leave allocated');
      setShowAllocDialog(false);
      if (selectedEmp) {
        const res = await api.get(`/leave/allocation/${selectedEmp}`);
        setAllocations(res.data.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle="Track and manage time off." />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--glass-bg)' }}>
        {[{ key: 'requests', label: 'Leave Requests' }, { key: 'allocation', label: 'Leave Allocation' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <>
          <div className="flex gap-2">
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-[var(--sidebar-hover)]'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="glass-card overflow-hidden fade-in">
            {!loading && requests.length === 0 ? (
              <EmptyState
                icon={FileX}
                title="No leave requests found"
                message="There are no leave requests matching the selected filter."
              />
            ) : (
              <table className="w-full glass-table">
                <thead><tr><th>Employee</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied On</th></tr></thead>
                <tbody>
                  {loading ? Array.from({length:5}).map((_,i)=><tr key={i}>{Array.from({length:8}).map((_,j)=><td key={j}><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>) :
                  requests.map(r => (
                    <tr key={r.id}>
                      <td className="font-medium text-on-surface">{r.full_name}</td>
                      <td>{r.leave_type_name}</td>
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
            )}
          </div>
        </>
      )}

      {tab === 'allocation' && (
        <>
          <div className="flex items-center gap-4">
            <div className="min-w-[300px]">
              <EmployeeSearch employees={employees} value={selectedEmp} onChange={setSelectedEmp} />
            </div>
            <button onClick={() => { setAllocForm({ employee_id: '', leave_type_id: '', allocated_days: '', year: new Date().getFullYear() }); setShowAllocDialog(true); }}
              className="btn-glow flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
              <Plus className="w-4 h-4" /> Allocate Leave
            </button>
          </div>

          {selectedEmp && (
            <div className="glass-card overflow-hidden fade-in">
              {allocations.length === 0 ? (
                <EmptyState
                  icon={CalendarX}
                  title="No allocations found"
                  message="This employee has no leave allocations yet."
                />
              ) : (
                <table className="w-full glass-table">
                  <thead><tr><th>Leave Type</th><th>Allocated</th><th>Used</th><th>Remaining</th></tr></thead>
                  <tbody>
                    {allocations.map(a => (
                      <tr key={a.id}>
                        <td className="font-medium text-on-surface">{a.name}</td>
                        <td>{a.allocated_days}</td>
                        <td>{a.used_days}</td>
                        <td className="font-semibold text-primary">{a.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {showAllocDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAllocDialog(false)}>
          <div className="glass-card-strong w-full max-w-md p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Allocate Leave</h2>
              <button onClick={() => setShowAllocDialog(false)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)]"><X className="w-4 h-4 text-on-surface-variant" /></button>
            </div>
            <form onSubmit={handleAllocSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Employee</label>
                <EmployeeSearch
                  employees={employees}
                  value={allocForm.employee_id}
                  onChange={(id) => setAllocForm(f => ({ ...f, employee_id: id }))}
                  placeholder="Search employee..."
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Leave Type</label>
                <select value={allocForm.leave_type_id} onChange={e => setAllocForm(f => ({ ...f, leave_type_id: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required>
                  <option value="">Select</option>
                  {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Days</label>
                  <input type="number" value={allocForm.allocated_days} onChange={e => setAllocForm(f => ({ ...f, allocated_days: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Year</label>
                  <input type="number" value={allocForm.year} onChange={e => setAllocForm(f => ({ ...f, year: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Allocate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}