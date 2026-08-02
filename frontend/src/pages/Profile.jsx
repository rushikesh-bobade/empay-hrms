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
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-[var(--sidebar-hover)] transition-colors">
          <Edit className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit'}
        </button>
      </PageHeader>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.full_name?[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">{user?.full_name}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{user?.email}</p>
            <RoleBadge role={user?.role} className="mt-2" />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-1.5 font-semibold">Full Name</label>
              {editing ? <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                : <p className="text-sm text-on-surface py-2 font-medium">{user?.full_name}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-1.5 font-semibold">Email</label>
              <p className="text-sm text-on-surface py-2 font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-1.5 font-semibold">Department</label>
              {editing ? <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                : <p className="text-sm text-on-surface py-2 font-medium">{user?.department || '—'}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-1.5 font-semibold">Designation</label>
              {editing ? <input type="text" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                : <p className="text-sm text-on-surface py-2 font-medium">{user?.designation || '—'}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-1.5 font-semibold">Phone</label>
              {editing ? <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                : <p className="text-sm text-on-surface py-2 font-medium">{user?.phone || '—'}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-1.5 font-semibold">Date Joined</label>
              <p className="text-sm text-on-surface py-2 font-medium">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN') : '—'}</p>
            </div>
          </div>
          {editing && (
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="btn-glow flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
