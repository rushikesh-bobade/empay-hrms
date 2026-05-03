import { useState, useEffect } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import { Settings as SettingsIcon, Building2, Clock, Globe, Database, Server, HardDrive, Loader2, Save, CheckCircle2, Mail, Send } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'sonner';

// Reusable toggle component
function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-primary' : 'bg-outline-variant'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// Reusable setting row
function SettingRow({ title, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-surface last:border-0">
      <div className="pr-4">
        <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({});
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings(res.data.data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'Database' && !dbStats) {
      api.get('/settings/db-stats').then(res => setDbStats(res.data.data)).catch(console.error);
    }
    if (activeTab === 'Leave Policies' && !leaveTypes) {
      api.get('/leave/types').then(res => setLeaveTypes(res.data.data)).catch(console.error);
    }
  }, [activeTab, dbStats, leaveTypes]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      setSettings(res.data.data || settings);
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await api.post('/auth/test-email');
      toast.success('Test email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'SMTP connection failed');
    }
    setTestingEmail(false);
  };

  const tabs = [
    { icon: Building2, title: 'General', desc: 'Organization details and work schedule' },
    { icon: Clock, title: 'Leave Policies', desc: 'Manage leave types and allocations' },
    { icon: Mail, title: 'Email & SMTP', desc: 'Email delivery and notification preferences' },
    { icon: Database, title: 'Database', desc: 'Connection status and record counts' },
  ];

  const handleSaveLeave = async () => {
    if (!editingLeave) return;
    try {
      const res = await api.put(`/leave/types/${editingLeave.id}`, {
        max_days_per_year: parseInt(editingLeave.max_days_per_year),
        is_paid: editingLeave.is_paid
      });
      setLeaveTypes(prev => prev.map(lt => lt.id === editingLeave.id ? res.data.data : lt));
      setEditingLeave(null);
      toast.success('Leave policy updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave policy');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and preferences." />
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 space-y-2 flex-shrink-0">
          {tabs.map(item => (
            <div 
              key={item.title} 
              onClick={() => setActiveTab(item.title)}
              className={`glass-card p-4 flex items-center gap-3.5 cursor-pointer transition-all ${activeTab === item.title ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(77,142,255,0.08)]' : 'hover:border-primary/20'}`}
            >
              <div className={`p-2 rounded-lg transition-colors ${activeTab === item.title ? 'bg-primary/15' : 'bg-surface-variant/20'}`}>
                <item.icon className={`w-4 h-4 ${activeTab === item.title ? 'text-primary' : 'text-on-surface-variant'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface text-sm">{item.title}</h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 glass-card p-6 fade-in min-h-[500px]">
          {loading ? (
            <div className="flex justify-center items-center py-32"><Loader2 className="w-6 h-6 animate-spin text-primary opacity-40" /></div>

          ) : activeTab === 'Leave Policies' ? (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Leave Policies</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Manage employee leave entitlements and types.</p>
                </div>
              </div>

              {!leaveTypes ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary opacity-40" /></div>
              ) : (
                <div className="space-y-3">
                  {leaveTypes.map(lt => {
                    const isEditing = editingLeave?.id === lt.id;
                    return (
                      <div key={lt.id} className="p-4 rounded-xl bg-surface-variant/5 border border-surface transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <h4 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                              {lt.name}
                              {!lt.is_paid && <span className="text-[10px] uppercase font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded">Unpaid</span>}
                            </h4>
                            <p className="text-xs text-on-surface-variant mt-1">{lt.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {isEditing ? (
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    className="input-glass w-20 px-2 py-1 text-sm rounded text-center" 
                                    value={editingLeave.max_days_per_year} 
                                    onChange={e => setEditingLeave({...editingLeave, max_days_per_year: e.target.value})}
                                  />
                                  <span className="text-xs font-semibold text-on-surface-variant">days/yr</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => setEditingLeave(null)} className="text-xs text-on-surface-variant hover:text-on-surface">Cancel</button>
                                  <button onClick={handleSaveLeave} className="btn-glow px-3 py-1 rounded text-xs font-bold text-white bg-primary">Save</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <div className="text-lg font-bold text-primary">{lt.max_days_per_year} <span className="text-xs text-on-surface-variant font-medium">days/yr</span></div>
                                <button onClick={() => setEditingLeave(lt)} className="text-xs text-primary hover:text-primary-light mt-1 font-semibold">Edit Policy</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'General' ? (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">General Settings</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Organization details and work preferences</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-glow px-5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 flex items-center gap-2" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Changes
                </button>
              </div>

              <div className="space-y-5">
                {/* Organization Section */}
                <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" /> Organization
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Company Name</label>
                      <input 
                        value={settings.company_name || ''} 
                        onChange={e => updateSetting('company_name', e.target.value)} 
                        className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg" 
                        placeholder="e.g. EmPay Pvt. Ltd."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Company Email</label>
                      <input 
                        value={settings.company_email || ''} 
                        onChange={e => updateSetting('company_email', e.target.value)} 
                        className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg" 
                        placeholder="e.g. hr@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Company Phone</label>
                      <input 
                        value={settings.company_phone || ''} 
                        onChange={e => updateSetting('company_phone', e.target.value)} 
                        className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg" 
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Address</label>
                      <input 
                        value={settings.company_address || ''} 
                        onChange={e => updateSetting('company_address', e.target.value)} 
                        className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg" 
                        placeholder="e.g. Mumbai, Maharashtra"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Schedule Section */}
                <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Work Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Timezone</label>
                      <div className="relative">
                        <select 
                          value={settings.timezone || 'Asia/Kolkata'} 
                          onChange={e => updateSetting('timezone', e.target.value)} 
                          className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg appearance-none cursor-pointer"
                        >
                          <option value="Asia/Kolkata">IST (India)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">EST (US East)</option>
                          <option value="Europe/London">GMT (UK)</option>
                          <option value="Asia/Dubai">GST (Dubai)</option>
                          <option value="Asia/Singapore">SGT (Singapore)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xs">▼</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Working Days/Week</label>
                      <div className="relative">
                        <select 
                          value={settings.working_days_per_week || '5'} 
                          onChange={e => updateSetting('working_days_per_week', e.target.value)} 
                          className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg appearance-none cursor-pointer"
                        >
                          <option value="5">5 days (Mon–Fri)</option>
                          <option value="6">6 days (Mon–Sat)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xs">▼</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Office Start Time</label>
                      <input 
                        type="time"
                        value={settings.office_start_time || '09:00'} 
                        onChange={e => updateSetting('office_start_time', e.target.value)} 
                        className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Office End Time</label>
                      <input 
                        type="time"
                        value={settings.office_end_time || '18:00'} 
                        onChange={e => updateSetting('office_end_time', e.target.value)} 
                        className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg" 
                      />
                    </div>
                  </div>
                </div>

                {/* Locale Section */}
                <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Locale & Format
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Currency</label>
                      <div className="relative">
                        <select 
                          value={settings.currency || 'INR'} 
                          onChange={e => updateSetting('currency', e.target.value)} 
                          className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg appearance-none cursor-pointer"
                        >
                          <option value="INR">₹ INR (Indian Rupee)</option>
                          <option value="USD">$ USD (US Dollar)</option>
                          <option value="EUR">€ EUR (Euro)</option>
                          <option value="GBP">£ GBP (British Pound)</option>
                          <option value="AED">د.إ AED (Dirham)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xs">▼</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Date Format</label>
                      <div className="relative">
                        <select 
                          value={settings.date_format || 'DD/MM/YYYY'} 
                          onChange={e => updateSetting('date_format', e.target.value)} 
                          className="input-glass w-full px-3.5 py-2.5 text-sm rounded-lg appearance-none cursor-pointer"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xs">▼</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : activeTab === 'Email & SMTP' ? (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Email & Notifications</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Configure automated email delivery</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleTestEmail} disabled={testingEmail} className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface border border-surface hover:bg-surface-variant/20 transition-all flex items-center gap-2 disabled:opacity-50">
                    {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send Test Email
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-glow px-5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 flex items-center gap-2" style={{background:'linear-gradient(135deg,#4d8eff,#571bc1)'}}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Changes
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {/* SMTP Status */}
                <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5" /> SMTP Configuration
                  </h3>
                  <div className="flex items-center gap-3 p-3.5 rounded-lg bg-success/5 border border-success/20 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-success">Gmail SMTP Connected</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Configure SMTP credentials in the backend .env file</p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    SMTP settings are managed through your server&apos;s environment variables for security. Update <code className="px-1.5 py-0.5 bg-surface-variant/30 rounded text-[11px] font-mono">SMTP_USER</code> and <code className="px-1.5 py-0.5 bg-surface-variant/30 rounded text-[11px] font-mono">SMTP_PASS</code> in the <code className="px-1.5 py-0.5 bg-surface-variant/30 rounded text-[11px] font-mono">.env</code> file.
                  </p>
                </div>

                {/* Email Triggers */}
                <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email Triggers
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mb-4">Choose which events trigger automated email notifications.</p>

                  <SettingRow title="Welcome Email" description="Send login credentials when a new employee is created">
                    <Toggle enabled={settings.email_on_register !== false} onToggle={() => updateSetting('email_on_register', !(settings.email_on_register !== false))} />
                  </SettingRow>
                  <SettingRow title="Leave Approval / Rejection" description="Notify employees when their leave request is processed">
                    <Toggle enabled={settings.email_on_leave_status !== false} onToggle={() => updateSetting('email_on_leave_status', !(settings.email_on_leave_status !== false))} />
                  </SettingRow>
                  <SettingRow title="HR Alerts" description="Email HR officers about absenteeism and new leave requests">
                    <Toggle enabled={settings.email_hr_alerts !== false} onToggle={() => updateSetting('email_hr_alerts', !(settings.email_hr_alerts !== false))} />
                  </SettingRow>
                  <SettingRow title="Payslip Generated" description="Notify employees when their monthly payslip is ready">
                    <Toggle enabled={settings.email_on_payslip !== false} onToggle={() => updateSetting('email_on_payslip', !(settings.email_on_payslip !== false))} />
                  </SettingRow>
                </div>
              </div>
            </div>

          ) : activeTab === 'Database' ? (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-on-surface">Database Overview</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Live statistics from your PostgreSQL database</p>
              </div>

              {!dbStats ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary opacity-40" /></div>
              ) : (
                <div className="space-y-5">
                  {/* Connection Info */}
                  <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Server className="w-3.5 h-3.5" /> Connection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3.5 rounded-lg bg-surface-variant/10 border border-surface">
                        <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Status</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          <p className="text-sm font-bold text-success">Connected</p>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-surface-variant/10 border border-surface">
                        <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Database</p>
                        <p className="text-sm font-bold text-on-surface mt-1.5">{dbStats.db_name}</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-surface-variant/10 border border-surface">
                        <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Size</p>
                        <p className="text-sm font-bold text-on-surface mt-1.5">{dbStats.db_size}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-3 font-mono">{dbStats.db_version}</p>
                  </div>

                  {/* Record Counts */}
                  <div className="p-5 rounded-xl bg-surface-variant/5 border border-surface">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5" /> Record Counts
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Users', count: dbStats.users, color: '#3b6ce7' },
                        { label: 'Attendance', count: dbStats.attendance, color: '#16a34a' },
                        { label: 'Leave Requests', count: dbStats.leave_requests, color: '#d97706' },
                        { label: 'Leave Types', count: dbStats.leave_types, color: '#8b5cf6' },
                        { label: 'Salary Structures', count: dbStats.salary_structures, color: '#0891b2' },
                        { label: 'Payslips', count: dbStats.payslips, color: '#ec4899' },
                        { label: 'Pay Runs', count: dbStats.payruns, color: '#059669' },
                        { label: 'Notifications', count: dbStats.notifications, color: '#6366f1' },
                        { label: 'Settings', count: dbStats.settings, color: '#64748b' },
                      ].map(item => (
                        <div key={item.label} className="p-3.5 rounded-lg bg-surface-variant/10 border border-surface flex items-center justify-between">
                          <span className="text-xs font-medium text-on-surface-variant">{item.label}</span>
                          <span className="text-sm font-extrabold" style={{ color: item.color }}>{item.count?.toLocaleString() || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
