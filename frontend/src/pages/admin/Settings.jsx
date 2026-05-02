import PageHeader from '../../components/shared/PageHeader';
import { Settings as SettingsIcon, Shield, Building, Clock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Settings" subtitle="System configuration" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/20"><Shield className="w-5 h-5 text-indigo-400" /></div>
            <h3 className="text-sm font-medium text-white">Role Management</h3>
          </div>
          <p className="text-sm text-slate-400">Roles are managed through the User Management page. Assign roles when creating or editing users.</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/20"><Building className="w-5 h-5 text-cyan-400" /></div>
            <h3 className="text-sm font-medium text-white">Organization</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Company Name</label>
              <input type="text" defaultValue="EmPay Corp" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/20"><Clock className="w-5 h-5 text-amber-400" /></div>
            <h3 className="text-sm font-medium text-white">Working Hours</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Start Time</label>
              <input type="time" defaultValue="09:00" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">End Time</label>
              <input type="time" defaultValue="18:00" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/20"><SettingsIcon className="w-5 h-5 text-emerald-400" /></div>
            <h3 className="text-sm font-medium text-white">Payroll Configuration</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">PF Rate (%)</label>
              <input type="number" defaultValue="12" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Professional Tax (₹)</label>
              <input type="number" defaultValue="200" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
