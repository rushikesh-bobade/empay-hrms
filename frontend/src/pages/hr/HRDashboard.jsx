import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { Users, CheckCircle, CalendarOff, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/hr').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><PageHeader title="HR Dashboard" /><div className="grid grid-cols-4 gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-32 rounded-2xl"/>)}</div></div>;

  const attendanceTrend = (data?.attendance_trend || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    Present: parseInt(d.present),
    Absent: parseInt(d.absent),
    'On Leave': parseInt(d.on_leave),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="HR Dashboard" subtitle="Overview of human resources metrics." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Employees" value={data?.total_employees || 0} icon={Users} color="primary" />
        <StatCard title="Active Employees" value={data?.active_employees || 0} icon={CheckCircle} color="success" />
        <StatCard title="On Leave Today" value={parseInt(data?.today_summary?.on_leave) || 0} icon={CalendarOff} color="warning" />
        <StatCard title="Pending Leaves" value={data?.pending_leave_requests || 0} icon={Clock} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Trends */}
        <div className="lg:col-span-2 glass-card p-5 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={12} />
              <YAxis stroke="var(--chart-axis)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '12px', color: 'var(--chart-tooltip-color)' }} />
              <Legend />
              <Bar dataKey="Present" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="On Leave" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent leave requests */}
        <div className="glass-card p-5 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Leave Requests</h3>
          <div className="space-y-2">
            {(data?.recent_leave_requests || []).slice(0, 8).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--table-row-hover)]">
                <div>
                  <p className="text-sm font-medium text-on-surface">{r.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{r.leave_type_name} · {r.total_days} day(s)</p>
                </div>
                <span className={`chip-${r.status} inline-flex px-2 py-0.5 rounded-full text-xs font-semibold`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
