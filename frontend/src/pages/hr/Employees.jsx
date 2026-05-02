import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import RoleBadge from '../../components/shared/RoleBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import { Edit, X } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', department: '', designation: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users');
      setEmployees(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ full_name: user.full_name, department: user.department || '', designation: user.designation || '', phone: user.phone || '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${editUser.id}`, form);
      setEditUser(null);
      fetchEmployees();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      header: 'Employee', cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{row.full_name?.charAt(0)?.toUpperCase()}</div>
          <div><p className="text-sm font-medium text-white">{row.full_name}</p><p className="text-xs text-slate-500">{row.email}</p></div>
        </div>
      ),
    },
    { header: 'Role', cell: (row) => <RoleBadge role={row.role} /> },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Designation', accessorKey: 'designation' },
    { header: 'Joined', cell: (row) => new Date(row.date_joined).toLocaleDateString('en-IN') },
    { header: 'Status', cell: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
    {
      header: 'Actions', cell: (row) => (
        <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Employees" subtitle="View and manage employee profiles" />
      <DataTable columns={columns} data={employees} searchKey={['full_name', 'email', 'department']} isLoading={loading} searchPlaceholder="Search employees..." />

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Edit Employee</h2>
              <button onClick={() => setEditUser(null)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Full Name</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Designation</label>
                  <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
