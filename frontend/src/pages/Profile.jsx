import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageHeader from '../components/shared/PageHeader';
import RoleBadge from '../components/shared/RoleBadge';
import { Save, Edit } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '', department: user?.department || '',
    designation: user?.designation || '', phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data.data);
      setEditing(false);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <PageHeader title="My Profile" subtitle="View and update your personal information">
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800">
          <Edit className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit'}
        </button>
      </PageHeader>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <RoleBadge role={user?.role} className="mt-2" />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Full Name</label>
              {editing ? <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                : <p className="text-sm text-white py-2">{user?.full_name}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Email</label>
              <p className="text-sm text-white py-2">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Department</label>
              {editing ? <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                : <p className="text-sm text-white py-2">{user?.department || '—'}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Designation</label>
              {editing ? <input type="text" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                : <p className="text-sm text-white py-2">{user?.designation || '—'}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Phone</label>
              {editing ? <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                : <p className="text-sm text-white py-2">{user?.phone || '—'}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Date Joined</label>
              <p className="text-sm text-white py-2">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN') : '—'}</p>
            </div>
          </div>
          {editing && (
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
