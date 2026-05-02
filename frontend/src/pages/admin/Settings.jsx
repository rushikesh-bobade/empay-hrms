import PageHeader from '../../components/shared/PageHeader';
import { Settings as SettingsIcon, Shield, Database, Bell } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and preferences." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { icon: Shield, title: 'Security', desc: 'Manage password policies and authentication settings', link: '#' },
          { icon: Database, title: 'Database', desc: 'View database connection status and statistics', link: '#' },
          { icon: Bell, title: 'Notifications', desc: 'Configure email and in-app notification preferences', link: '#' },
          { icon: SettingsIcon, title: 'General', desc: 'Company info, timezone, and general preferences', link: '#' },
          { icon: Shield, title: 'Roles & Permissions', desc: 'Manage user roles, access levels, and permissions', link: '/admin/users' },
        ].map(item => (
          <a href={item.link} key={item.title} className="glass-card p-5 flex items-start gap-4 cursor-pointer hover:border-primary/30 transition-all fade-in block no-underline">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(77, 142, 255, 0.1)', border: '1px solid rgba(77, 142, 255, 0.2)' }}>
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface">{item.title}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
