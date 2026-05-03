import { useState, useEffect } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import { Settings as SettingsIcon, Shield, Database, Bell, Loader2, Save } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({ company_name: '', timezone: 'UTC' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings(res.data.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings updated');
    } catch (err) { toast.error('Failed to update settings'); }
    setSaving(false);
  };

  const tabs = [
    { icon: SettingsIcon, title: 'General', desc: 'Company info, timezone, and general preferences' },
    { icon: Shield, title: 'Security', desc: 'Manage password policies and authentication settings' },
    { icon: Database, title: 'Database', desc: 'View database connection status and statistics' },
    { icon: Bell, title: 'Notifications', desc: 'Configure email and in-app notification preferences' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and preferences." />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 space-y-3">
          {tabs.map(item => (
            <div 
              key={item.title} 
              onClick={() => setActiveTab(item.title)}
              className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all fade-in ${activeTab === item.title ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(77,142,255,0.1)]' : 'hover:border-primary/30'}`}
            >
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(77, 142, 255, 0.1)', border: '1px solid rgba(77, 142, 255, 0.2)' }}>
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-sm">{item.title}</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-2/3 glass-card p-6 fade-in min-h-[450px] relative overflow-hidden">
          <h2 className="text-xl font-extrabold text-on-surface mb-8 tracking-tight">{activeTab} Settings</h2>
          
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" /></div>
          ) : activeTab === 'General' ? (
            <form onSubmit={handleSave} className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-bold text-primary mb-2">Company Name</label>
                <input 
                  value={settings.company_name || ''} 
                  onChange={e => setSettings(s => ({...s, company_name: e.target.value}))} 
                  className="input-glass w-full px-4 py-3 text-sm rounded-xl focus:ring-2 ring-primary/20 transition-all" 
                  placeholder="Enter organization name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-bold text-primary mb-2">Timezone</label>
                <div className="relative">
                  <select 
                    value={settings.timezone || 'UTC'} 
                    onChange={e => setSettings(s => ({...s, timezone: e.target.value}))} 
                    className="input-glass w-full px-4 py-3 text-sm rounded-xl appearance-none cursor-pointer"
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York">EST (Eastern Standard Time)</option>
                    <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                    <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" disabled={saving} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save General Settings
                </button>
              </div>
            </form>
          ) : activeTab === 'Notifications' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-variant/10 border border-surface group hover:border-primary/30 transition-all">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Email Notifications</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Receive automated alerts for leaves and attendance summaries.</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" /></div>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-variant/10 border border-surface group hover:border-primary/30 transition-all">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">System Alerts</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Show real-time notifications in the top bar dropdown.</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" /></div>
              </div>
              <div className="pt-4 flex items-center gap-4">
                <button 
                  onClick={handleSave}
                  className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2" 
                  style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await api.post('/auth/test-email');
                      toast.success('Test email sent! Check your inbox.');
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to send test email');
                    }
                  }}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-on-surface border border-surface hover:bg-surface-variant/20 transition-all"
                >
                  Test Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-on-surface-variant border border-dashed border-outline rounded-2xl flex flex-col items-center gap-4 animate-in fade-in duration-700">
              <div className="w-20 h-20 rounded-full bg-surface-variant/10 flex items-center justify-center">
                <SettingsIcon className="w-10 h-10 opacity-10" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-on-surface opacity-60">Module Under Construction</p>
                <p className="text-xs opacity-50">This settings module will be available in the next update.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
