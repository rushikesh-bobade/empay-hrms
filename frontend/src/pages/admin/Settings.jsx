import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { Shield, Bell, Globe, Building2, Clock, Calendar, Banknote, Loader2, Save, UserCircle, Smartphone, FileText, RefreshCw, Receipt, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import Profile from '../shared/Profile';

const ALL_TABS = [
  { key: 'profile', label: 'Profile', icon: UserCircle, roles: ['admin', 'hr_officer', 'payroll_officer', 'employee'] },
  { key: 'defaults', label: 'Employee Defaults', icon: Building2, roles: ['admin', 'hr_officer'] },
  { key: 'hr', label: 'HR Management', icon: Calendar, roles: ['admin', 'hr_officer'] },
  { key: 'salary_config', label: 'Salary Configuration', icon: Banknote, roles: ['admin', 'payroll_officer'] },
  { key: 'deductions_taxes', label: 'Deductions & Taxes', icon: FileText, roles: ['admin', 'payroll_officer'] },
  { key: 'payroll_processing', label: 'Payroll Processing', icon: RefreshCw, roles: ['admin', 'payroll_officer'] },
  { key: 'payslip_settings', label: 'Payslip Settings', icon: Receipt, roles: ['admin', 'payroll_officer'] },
  { key: 'payment_settings', label: 'Payment Settings', icon: DollarSign, roles: ['admin', 'payroll_officer'] },
  { key: 'preferences', label: 'Preferences', icon: Globe, roles: ['employee'] },
  { key: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'hr_officer', 'payroll_officer', 'employee'] },
  { key: 'security', label: 'Security', icon: Shield, roles: ['admin', 'hr_officer', 'payroll_officer', 'employee'] },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSettings = {
  company: 'EmPay Corp',
  email: 'hr@empaycorp.com',
  phone: '+91 9876543210',
  address: '123 Tech Park, Whitefield\nBangalore, Karnataka 560066',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  workStart: '09:00',
  workEnd: '18:00',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
  language: 'en',
  casualLeave: 12,
  sickLeave: 8,
  earnedLeave: 15,
  pfPercent: 12,
  professionalTax: 200,
  salaryCycle: 'monthly',
  payrollRunDay: 28,
  emailNotifications: true,
  systemAlerts: true,
  pushNotifications: false,
  basePayRatio: 40,
  hraRatio: 20,
  daRatio: 10,
  taxBracket1: 500000,
  taxBracket2: 1000000,
  standardDeduction: 50000,
  autoApprovePayroll: false,
  payslipLogo: '',
  signatoryName: 'John Doe',
  bankIntegration: false,
  paymentMethod: 'bank_transfer'
};

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = ALL_TABS.filter(t => t.roles.includes(user?.role));

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and user preferences." />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto max-w-full no-scrollbar" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.key ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="fade-in">
        {activeTab === 'profile' && <div className="-mt-6"><Profile /></div>}
        {activeTab === 'defaults' && <EmployeeDefaultsPanel />}
        {activeTab === 'hr' && <HRManagementPanel />}
        {activeTab === 'salary_config' && <SalaryConfigPanel />}
        {activeTab === 'deductions_taxes' && <DeductionsTaxesPanel />}
        {activeTab === 'payroll_processing' && <PayrollProcessingPanel />}
        {activeTab === 'payslip_settings' && <PayslipSettingsPanel />}
        {activeTab === 'payment_settings' && <PaymentSettingsPanel />}
        {activeTab === 'preferences' && <PreferencesPanel />}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'security' && <SecurityPanel userId={user?.id} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EMPLOYEE DEFAULTS PANEL
   ═══════════════════════════════════════════════ */
function EmployeeDefaultsPanel() {
  const [form, setForm] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) };
    } catch { return { ...defaultSettings }; }
  });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true);
    toast.success('Defaults saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard icon={Building2} title="Organization" subtitle="Company identity settings.">
          <div className="space-y-4">
            <Field label="Company Name"><input value={form.company} onChange={e => set('company', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
              <Field label="Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Globe} title="Locale Defaults" subtitle="Regional display settings.">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Timezone">
                <select value={form.timezone} onChange={e => set('timezone', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </Field>
              <Field label="Currency">
                <select value={form.currency} onChange={e => set('currency', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Banknote} title="Payroll Defaults" subtitle="Standard deduction & cycle rules.">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="PF %"><input type="number" value={form.pfPercent} onChange={e => set('pfPercent', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
              <Field label="Salary Cycle">
                <select value={form.salaryCycle} onChange={e => set('salaryCycle', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-Weekly</option>
                </select>
              </Field>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="sticky bottom-6 flex justify-end">
        <button onClick={handleSave} className="btn-glow flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-2xl transition-all duration-300"
          style={{ background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
          <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save Defaults'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HR MANAGEMENT PANEL (Leaves & Attendance)
   ═══════════════════════════════════════════════ */
function HRManagementPanel() {
  const [form, setForm] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) };
    } catch { return { ...defaultSettings }; }
  });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      workingDays: f.workingDays.includes(day) ? f.workingDays.filter(d => d !== day) : [...f.workingDays, day],
    }));
  };

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true);
    toast.success('HR Rules saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard icon={Calendar} title="Leave Management" subtitle="Default annual leave allocations.">
          <div className="space-y-3">
            {[
              { key: 'casualLeave', label: 'Casual Leave', color: '#4d8eff' },
              { key: 'sickLeave', label: 'Sick Leave', color: '#f87171' },
              { key: 'earnedLeave', label: 'Earned Leave', color: '#4cd7f6' },
            ].map(lt => (
              <div key={lt.key} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: lt.color }} />
                  <span className="text-sm text-on-surface">{lt.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={form[lt.key]} onChange={e => set(lt.key, parseInt(e.target.value) || 0)} className="input-glass w-16 px-2 py-1 text-sm rounded-lg text-center" />
                  <span className="text-xs text-on-surface-variant">days</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Clock} title="Attendance Settings" subtitle="Define working hours and days.">
          <div className="space-y-4">
            <Field label="Working Days">
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map(day => (
                  <button key={day} onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                      form.workingDays.includes(day) ? 'bg-primary/20 text-primary border-primary/40' : 'bg-black/20 text-on-surface-variant border-white/5 hover:border-white/15'
                    }`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Shift Start"><input type="time" value={form.workStart} onChange={e => set('workStart', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
              <Field label="Shift End"><input type="time" value={form.workEnd} onChange={e => set('workEnd', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="sticky bottom-6 flex justify-end">
        <button onClick={handleSave} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white shadow-2xl transition-all duration-300"
          style={{ background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
          {saved ? 'Saved ✓' : 'Update HR Rules'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SALARY CONFIGURATION PANEL
   ═══════════════════════════════════════════════ */
function SalaryConfigPanel() {
  const [form, setForm] = useState(() => { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) }; } catch { return { ...defaultSettings }; } });
  const [saved, setSaved] = useState(false);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true); toast.success('Salary configuration saved'); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionCard icon={Banknote} title="Base Salary Structure" subtitle="Define default salary component ratios.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Base Pay % (of CTC)"><input type="number" value={form.basePayRatio} onChange={e => set('basePayRatio', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="HRA % (of Basic)"><input type="number" value={form.hraRatio} onChange={e => set('hraRatio', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="DA % (of Basic)"><input type="number" value={form.daRatio} onChange={e => set('daRatio', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
        </div>
      </SectionCard>
      <div className="flex justify-end"><button onClick={handleSave} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>{saved ? 'Saved ✓' : 'Save Changes'}</button></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DEDUCTIONS & TAXES PANEL
   ═══════════════════════════════════════════════ */
function DeductionsTaxesPanel() {
  const [form, setForm] = useState(() => { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) }; } catch { return { ...defaultSettings }; } });
  const [saved, setSaved] = useState(false);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true); toast.success('Tax rules saved'); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionCard icon={FileText} title="Tax & Deductions" subtitle="Configure tax brackets and standard deductions.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Tax Bracket 1 Minimum"><input type="number" value={form.taxBracket1} onChange={e => set('taxBracket1', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="Tax Bracket 2 Minimum"><input type="number" value={form.taxBracket2} onChange={e => set('taxBracket2', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="Standard Deduction"><input type="number" value={form.standardDeduction} onChange={e => set('standardDeduction', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="Professional Tax (Monthly)"><input type="number" value={form.professionalTax} onChange={e => set('professionalTax', parseFloat(e.target.value) || 0)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
        </div>
      </SectionCard>
      <div className="flex justify-end"><button onClick={handleSave} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>{saved ? 'Saved ✓' : 'Save Changes'}</button></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAYROLL PROCESSING PANEL
   ═══════════════════════════════════════════════ */
function PayrollProcessingPanel() {
  const [form, setForm] = useState(() => { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) }; } catch { return { ...defaultSettings }; } });
  const [saved, setSaved] = useState(false);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true); toast.success('Processing rules saved'); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionCard icon={RefreshCw} title="Processing Configuration" subtitle="Set payroll generation rules.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Payroll Generation Day (e.g. 28th)"><input type="number" min="1" max="31" value={form.payrollRunDay} onChange={e => set('payrollRunDay', parseInt(e.target.value) || 28)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="Auto Approve Draft Payruns">
            <select value={form.autoApprovePayroll} onChange={e => set('autoApprovePayroll', e.target.value === 'true')} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
              <option value="false">Manual Approval Required</option>
              <option value="true">Auto Approve</option>
            </select>
          </Field>
        </div>
      </SectionCard>
      <div className="flex justify-end"><button onClick={handleSave} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>{saved ? 'Saved ✓' : 'Save Changes'}</button></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAYSLIP SETTINGS PANEL
   ═══════════════════════════════════════════════ */
function PayslipSettingsPanel() {
  const [form, setForm] = useState(() => { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) }; } catch { return { ...defaultSettings }; } });
  const [saved, setSaved] = useState(false);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true); toast.success('Payslip settings saved'); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionCard icon={Receipt} title="Payslip Customization" subtitle="Information printed on employee payslips.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Company Logo URL"><input type="text" placeholder="https://..." value={form.payslipLogo} onChange={e => set('payslipLogo', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
          <Field label="Authorized Signatory Name"><input type="text" value={form.signatoryName} onChange={e => set('signatoryName', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" /></Field>
        </div>
      </SectionCard>
      <div className="flex justify-end"><button onClick={handleSave} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>{saved ? 'Saved ✓' : 'Save Changes'}</button></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAYMENT SETTINGS PANEL
   ═══════════════════════════════════════════════ */
function PaymentSettingsPanel() {
  const [form, setForm] = useState(() => { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) }; } catch { return { ...defaultSettings }; } });
  const [saved, setSaved] = useState(false);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('empay_general_prefs', JSON.stringify(form));
    setSaved(true); toast.success('Payment settings saved'); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionCard icon={DollarSign} title="Payment Methods & Integration" subtitle="Configure how salaries are disbursed.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Default Payment Method">
            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
              <option value="bank_transfer">Direct Bank Transfer (NEFT/RTGS)</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </select>
          </Field>
          <Field label="Enable Bank Integration API">
            <select value={form.bankIntegration} onChange={e => set('bankIntegration', e.target.value === 'true')} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl">
              <option value="false">Disabled (Manual CSV Export)</option>
              <option value="true">Enabled (Auto-Disburse)</option>
            </select>
          </Field>
        </div>
      </SectionCard>
      <div className="flex justify-end"><button onClick={handleSave} className="btn-glow px-8 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>{saved ? 'Saved ✓' : 'Save Changes'}</button></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NOTIFICATIONS PANEL
   ═══════════════════════════════════════════════ */
function NotificationsPanel() {
  const [form, setForm] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem('empay_general_prefs')) };
    } catch { return { ...defaultSettings }; }
  });

  const set = (key, val) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    localStorage.setItem('empay_general_prefs', JSON.stringify(updated));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionCard icon={Bell} title="Notifications" subtitle="Control how you stay updated.">
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Summaries and alerts sent to your inbox.', icon: Globe },
            { key: 'systemAlerts', label: 'System Alerts', desc: 'In-app banners and activity feed updates.', icon: Bell },
            { key: 'pushNotifications', label: 'Enable Push Notifications', desc: 'Desktop/Mobile notifications even when the tab is closed.', icon: Smartphone },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant"><opt.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{opt.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</p>
                </div>
              </div>
              <button onClick={() => set(opt.key, !form[opt.key])}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form[opt.key] ? 'bg-primary' : 'bg-white/10'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300 ${form[opt.key] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECURITY PANEL
   ═══════════════════════════════════════════════ */
function SecurityPanel({ userId }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.patch(`/users/${userId}/password`, { old_password: form.old_password, new_password: form.new_password });
      toast.success('Password updated');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="max-w-lg">
      <SectionCard icon={Shield} title="Security Settings" subtitle="Manage your account access.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current Password"><input type="password" value={form.old_password} onChange={e => setForm(f => ({ ...f, old_password: e.target.value }))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" required /></Field>
          <Field label="New Password"><input type="password" value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" required /></Field>
          <Field label="Confirm Password"><input type="password" value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} className="input-glass w-full px-3 py-2.5 text-sm rounded-xl" required /></Field>
          <button type="submit" disabled={saving} className="btn-glow w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="glass-panel rounded-2xl p-6 fade-in border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Icon className="w-5 h-5" /></div>
        <div><h3 className="text-sm font-bold text-on-surface leading-tight">{title}</h3><p className="text-[11px] text-on-surface-variant mt-0.5">{subtitle}</p></div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] uppercase tracking-wider font-bold text-on-surface-variant ml-1">{label}</label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PREFERENCES PANEL (Employee)
   ═══════════════════════════════════════════════ */
function PreferencesPanel() {
  const { preference, setPreference } = useTheme();
  const [lang, setLang] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success('Preferences saved successfully!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--t-on-surface)' }}>App Preferences</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--t-on-surface-variant)' }}>Customize your dashboard experience.</p>
        </div>
        <button onClick={handleSave} className="btn-glow flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Display & Language" subtitle="Visual and localization settings." icon={Globe} color="#3b82f6">
          <Field label="Interface Theme">
            <select value={preference} onChange={e => setPreference(e.target.value)} className="input-glass w-full px-4 py-2.5 text-sm rounded-xl appearance-none">
              <option value="dark">Dark Mode (Default)</option>
              <option value="light">Light Mode</option>
              <option value="system">System Default</option>
            </select>
          </Field>
          <Field label="Language">
            <select value={lang} onChange={e => setLang(e.target.value)} className="input-glass w-full px-4 py-2.5 text-sm rounded-xl appearance-none">
              <option value="en">English (US)</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
            </select>
          </Field>
        </Section>
      </div>
    </div>
  );
}

