import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import RoleBadge from '../../components/shared/RoleBadge';
import UserAvatar from '../../components/shared/UserAvatar';
import { Search, Mail, Phone } from 'lucide-react';

export default function Directory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users', { params: search ? { search } : {} })
      .then(res => { setEmployees(res.data.data.filter(u => u.is_active)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);



  return (
    <div className="space-y-6">
      <PageHeader title="Employee Directory" subtitle="Find and connect with your colleagues." />
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
        <input type="text" placeholder="Search by name, email, department..." value={search} onChange={e => setSearch(e.target.value)} className="input-glass w-full pl-10 pr-4 py-2.5 text-sm rounded-xl" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map((e, idx) => (
            <div key={e.id} className="glass-card p-5 flex flex-col items-center text-center fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <UserAvatar user={e} size="lg" />
              <h3 className="font-semibold text-on-surface text-sm">{e.full_name}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{e.designation || e.role}</p>
              <div className="mt-2"><RoleBadge role={e.role} /></div>
              <p className="text-xs text-on-surface-variant mt-2">{e.department || '—'}</p>
              <div className="flex items-center gap-3 mt-3">
                {e.email && <a href={`mailto:${e.email}`} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-on-surface-variant hover:text-primary transition-colors"><Mail className="w-3.5 h-3.5" /></a>}
                {e.phone && <a href={`tel:${e.phone}`} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-on-surface-variant hover:text-primary transition-colors"><Phone className="w-3.5 h-3.5" /></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
