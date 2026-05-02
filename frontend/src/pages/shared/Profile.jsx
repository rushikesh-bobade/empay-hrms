import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import RoleBadge from '../../components/shared/RoleBadge';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '', phone: user?.phone || '', department: user?.department || '', designation: user?.designation || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/users/${user.id}`, form);
      updateUser(form);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post(`/users/${user.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profile_pic: res.data.data.profile_pic });
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const profilePicUrl = user?.profile_pic ? `${SERVER_URL}${user.profile_pic}` : null;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="View and update your personal information." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center fade-in">
          <div className="relative">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={user?.full_name} className="w-24 h-24 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', color: 'white' }}>
                {getInitials(user?.full_name)}
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(77,142,255,0.3)', border: '1px solid rgba(77,142,255,0.5)' }}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <Camera className="w-3.5 h-3.5 text-primary" />}
            </button>
          </div>
          <h2 className="text-lg font-bold text-on-surface mt-4">{user?.full_name}</h2>
          <p className="text-sm text-on-surface-variant">{user?.email}</p>
          <div className="mt-3"><RoleBadge role={user?.role} /></div>
          <div className="mt-4 w-full space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-on-surface-variant">Department</span><span className="text-on-surface">{user?.department || '—'}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Designation</span><span className="text-on-surface">{user?.designation || '—'}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Joined</span><span className="text-on-surface">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-5">Update Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></div>
              <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Department</label>
                <input value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></div>
              <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Designation</label>
                <input value={form.designation} onChange={e => setForm(f => ({...f, designation: e.target.value}))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></div>
            </div>
            <div><label className="block text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1.5">Email (readonly)</label>
              <input value={user?.email || ''} disabled className="input-glass w-full px-3 py-2.5 text-sm rounded-xl opacity-50" /></div>
            <button type="submit" disabled={saving} className="btn-glow px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
