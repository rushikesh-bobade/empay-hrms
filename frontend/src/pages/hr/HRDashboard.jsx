import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import { Users, CheckCircle, CalendarOff, Clock } from 'lucide-react';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/hr').then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><PageHeader title="HR Dashboard" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800/50 rounded-xl animate-pulse" />)}</div></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="HR Dashboard" subtitle="Employee and leave overview" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.active_employees || 0} icon={Users} color="blue" />
        <StatCard title="Present Today" value={data?.today_summary?.present || 0} icon={CheckCircle} color="green" />
        <StatCard title="On Leave Today" value={data?.today_summary?.on_leave || 0} icon={CalendarOff} color="amber" />
        <StatCard title="Pending Requests" value={data?.pending_leave_requests || 0} icon={Clock} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees on leave today */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Employees On Leave Today</h3>
          {data?.on_leave_today?.length > 0 ? (
            <div className="space-y-3">
              {data.on_leave_today.map(emp => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">{emp.full_name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{emp.full_name}</p>
                    <p className="text-xs text-slate-500">{emp.department} · {emp.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No employees on leave today.</p>}
        </div>

        {/* Recent leave requests */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {(data?.recent_leave_requests || []).slice(0, 6).map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{req.employee_name}</p>
                  <p className="text-xs text-slate-500">{req.leave_type_name} · {req.total_days} day(s)</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
