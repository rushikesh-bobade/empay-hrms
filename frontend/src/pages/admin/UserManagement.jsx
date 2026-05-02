import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import RoleBadge from '../../components/shared/RoleBadge';
import UserAvatar from '../../components/shared/UserAvatar';
import { UserPlus, Search, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const openAdd = () => {
    setEditUser(null);
    setForm({ full_name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '' });
    setShowDialog(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ full_name: user.full_name, email: user.email, role: user.role, department: user.department || '', designation: user.designation || '', phone: user.phone || '' });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editUser && form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form);
        toast.success('User updated');
      } else {
        await api.post('/auth/register', form);
        toast.success('User created');
      }
      setShowDialog(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  const toggleActive = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/toggle-active`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };



  const filtered = users;

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Manage user access, roles, and status across the organization.">
        <button onClick={openAdd} className="btn-glow flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input type="text" placeholder="Search employees..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-glass w-full pl-10 pr-4 py-2 text-sm rounded-xl" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-glass px-3 py-2 text-sm rounded-xl min-w-[150px]">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hr_officer">HR Officer</option>
          <option value="payroll_officer">Payroll Officer</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden fade-in">
        <div className="overflow-x-auto">
          <table className="w-full glass-table">
            <thead><tr>
              <th>Employee</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton h-4 w-20 rounded" /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} size="sm" />
                      <span className="font-medium text-on-surface">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="text-on-surface-variant">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>{u.department || '—'}</td>
                  <td>{u.designation || '—'}</td>
                  <td>
                    <span className={`chip-${u.is_active ? 'active' : 'inactive'} inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(u)} className="px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">Edit</button>
                      <button onClick={() => toggleActive(u.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium text-warning hover:bg-warning/10 transition-colors">
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDialog(false)}>
          <div className="glass-card-strong w-full max-w-lg p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">{editUser ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowDialog(false)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)]"><X className="w-4 h-4 text-on-surface-variant" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Full Name</label>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required disabled={!!editUser} />
                </div>
              </div>
              {!editUser && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Password</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Confirm Password</label>
                    <input type="password" value={form.confirm_password || ''} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" required />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl">
                    <option value="admin">Admin</option>
                    <option value="hr_officer">HR Officer</option>
                    <option value="payroll_officer">Payroll Officer</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Department</label>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Designation</label>
                  <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editUser ? 'Save Changes' : 'Create Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
