import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { Search, Mail, Phone } from 'lucide-react';

export default function Directory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users').then(r => setEmployees(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search ? employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
  ) : employees;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Employee Directory" subtitle="Browse employee contact information">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className="glass-card rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {emp.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{emp.full_name}</p>
                  <p className="text-xs text-slate-500">{emp.designation}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-400"><span className="text-slate-600">Department:</span> {emp.department || '—'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="w-3 h-3" /> {emp.email}
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="w-3 h-3" /> {emp.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
