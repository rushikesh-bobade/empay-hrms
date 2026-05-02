import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import RoleBadge from '../../components/shared/RoleBadge';
import { Search, X, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '../../context/SocketContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({});
  const { socket } = useSocket();

  const fetchEmployees = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (deptFilter) params.department = deptFilter;
      const res = await api.get('/users', { params });
      setEmployees(res.data.data);
    } catch { /* empty */ }
    setLoading(false);
  }, [search, roleFilter, deptFilter]);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await api.get('/attendance/today');
      const map = {};
      if (res.data.data) {
        res.data.data.forEach(a => { map[a.employee_id] = a.status; });
      }
      setTodayAttendance(map);
    } catch { /* empty */ }
  }, []);

  useEffect(() => { fetchEmployees(); fetchTodayAttendance(); }, [fetchEmployees, fetchTodayAttendance]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => { fetchEmployees(); fetchTodayAttendance(); };
    socket.on('user_updated', handleUpdate);
    socket.on('attendance_updated', handleUpdate);
    return () => {
      socket.off('user_updated', handleUpdate);
      socket.off('attendance_updated', handleUpdate);
    };
  }, [socket, fetchEmployees, fetchTodayAttendance]);

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

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Extract unique departments
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const statusLabel = (empId) => {
    const s = todayAttendance[empId];
    if (!s) return { text: 'Not Checked In', cls: 'chip-absent' };
    if (s === 'present') return { text: 'Present', cls: 'chip-present' };
    if (s === 'on_leave') return { text: 'On Leave', cls: 'chip-on-leave' };
    if (s === 'half_day') return { text: 'Half Day', cls: 'chip-half-day' };
    if (s === 'absent') return { text: 'Absent', cls: 'chip-absent' };
    return { text: s, cls: 'chip-pending' };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="View and manage all employees." />

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input type="text" placeholder="Search employees..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-glass w-full pl-10 pr-4 py-2 text-sm rounded-xl" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-glass px-3 py-2 text-sm rounded-xl min-w-[160px]">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-glass px-3 py-2 text-sm rounded-xl min-w-[140px]">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hr_officer">HR Officer</option>
          <option value="payroll_officer">Payroll Officer</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 h-52 skeleton" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-on-surface-variant">No employees found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map(emp => {
            const status = statusLabel(emp.id);
            const picUrl = emp.profile_pic ? `${SERVER_URL}${emp.profile_pic}` : null;
            return (
              <div key={emp.id}
                className="glass-panel rounded-2xl p-5 flex flex-col items-center text-center fade-in cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => openEdit(emp)}>
                {/* Avatar */}
                {picUrl ? (
                  <img src={picUrl} alt={emp.full_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/15 mb-3 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', color: 'white', border: '2px solid rgba(255,255,255,0.15)' }}>
                    {getInitials(emp.full_name)}
                  </div>
                )}
                {/* Name & Designation */}
                <h3 className="text-sm font-semibold text-on-surface truncate w-full">{emp.full_name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 truncate w-full">{emp.designation || emp.department || '—'}</p>
                {/* Status Chip */}
                <div className="mt-3">
                  <span className={`${status.cls} inline-flex px-3 py-1 rounded-full text-xs font-semibold`}>
                    {status.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditUser(null)}>
          <div className="glass-panel-elevated w-full max-w-md p-6 fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface">Edit Employee</h2>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-on-surface-variant" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              {['full_name', 'department', 'designation', 'phone'].map(f => (
                <div key={f}>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">{f.replace('_', ' ')}</label>
                  <input value={form[f] || ''} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className="input-glass w-full px-3 py-2 text-sm rounded-xl" />
                </div>
              ))}
              <button type="submit" disabled={submitting} className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
