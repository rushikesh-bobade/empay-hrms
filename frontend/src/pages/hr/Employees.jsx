import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import UserAvatar from '../../components/shared/UserAvatar';
import { Search, X, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users', { params: { search } });
      setEmployees(res.data.data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, [search]);

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ full_name: user.full_name, department: user.department || '', designation: user.designation || '', phone: user.phone || '' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/users/${editUser.id}`, form);
      toast.success('Employee updated');
      setEditUser(null);
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...addForm, role: 'employee' });
      toast.success('Employee created successfully');
      setShowAdd(false);
      setAddForm({});
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create employee'); }
    setSubmitting(false);
  };



  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="View and manage all employees." />
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input type="text" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="input-glass w-full pl-10 pr-4 py-2 text-sm rounded-xl" />
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="glass-card overflow-hidden fade-in">
        <table className="w-full glass-table">
          <thead><tr><th>Employee</th><th>Email</th><th>Department</th><th>Designation</th><th>Date Joined</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i)=><tr key={i}>{Array.from({length:7}).map((_,j)=><td key={j}><div className="skeleton h-4 w-20 rounded"/></td>)}</tr>) :
            employees.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant">No employees found</td></tr> :
            employees.map(u => (
              <tr key={u.id}>
                <td><div className="flex items-center gap-3">
                  <UserAvatar user={u} size="sm" />
                  <span className="font-medium text-on-surface">{u.full_name}</span>
                </div></td>
                <td className="text-on-surface-variant">{u.email}</td>
                <td>{u.department||'—'}</td>
                <td>{u.designation||'—'}</td>
                <td>{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}</td>
                <td><span className={`chip-${u.is_active?'active':'inactive'} inline-flex px-2 py-0.5 rounded-full text-xs font-semibold`}>{u.is_active?'Active':'Inactive'}</span></td>
                <td><button onClick={()=>openEdit(u)} className="px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={()=>setEditUser(null)}>
          <div className="glass-card-strong w-full max-w-md p-6 fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Edit Employee</h2>
              <button onClick={()=>setEditUser(null)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)]"><X className="w-4 h-4 text-on-surface-variant"/></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              {['full_name','department','designation','phone'].map(f=>(
                <div key={f}>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">{f.replace('_',' ')}</label>
                  <input value={form[f]||''} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} className="input-glass w-full px-3 py-2 text-sm rounded-xl"/>
                </div>
              ))}
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="glass-card-strong w-full max-w-md p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Add New Employee</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-on-surface-variant" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              {['full_name', 'email', 'password', 'confirm_password', 'department', 'designation', 'phone'].map(f => (
                <div key={f}>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">{f.replace('_', ' ')}</label>
                  <input type={f.includes('password') ? 'password' : f === 'email' ? 'email' : 'text'} required value={addForm[f] || ''} onChange={e => setAddForm(p => ({ ...p, [f]: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" />
                </div>
              ))}
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 mt-4" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
