import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { Users, CheckCircle, CalendarOff, Clock } from 'lucide-react';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/hr').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><PageHeader title="HR Dashboard" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-32 rounded-2xl"/>)}</div></div>;

  return (
    <div className="space-y-6 overflow-x-hidden">
      <PageHeader title="HR Dashboard" subtitle="Overview of human resources metrics." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard title="Total Employees" value={data?.total_employees || 0} icon={Users} color="primary" />
        <StatCard title="Active Employees" value={data?.active_employees || 0} icon={CheckCircle} color="success" />
        <StatCard title="On Leave Today" value={parseInt(data?.today_summary?.on_leave, 10) || 0} icon={CalendarOff} color="warning" />
        <StatCard title="Pending Leaves" value={data?.pending_leave_requests || 0} icon={Clock} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* On leave today */}
        <div className="glass-card p-4 md:p-5 fade-in overflow-x-auto">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Employees On Leave Today</h3>
          {(data?.on_leave_today || []).length === 0 ? (
            <p className="text-sm text-on-surface-variant py-8 text-center">No employees on leave today</p>
          ) : (
            <div className="space-y-3">{data.(on_leave_today ?? []).map(emp => (
              <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--table-row-hover)]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4d8eff, #571bc1)', color: 'white' }}>
                  {emp.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1"><p className="text-sm font-medium text-on-surface truncate">{emp.full_name}</p><p className="text-xs text-on-surface-variant truncate">{emp.department} · {emp.designation}</p></div>
              </div>
            ))}</div>
          )}
        </div>

        {/* Recent leave requests */}
        <div className="glass-card p-4 md:p-5 fade-in overflow-x-auto">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Leave Requests</h3>
          <div className="space-y-2">
            {(data?.recent_leave_requests || []).slice(0, 8).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--table-row-hover)] gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-on-surface truncate">{r.full_name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{r.leave_type_name} · {r.total_days} day(s)</p>
                </div>
                <span className={`chip-${r.status} inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
