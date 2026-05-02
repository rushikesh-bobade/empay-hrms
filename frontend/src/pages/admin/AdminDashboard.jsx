import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import { Users, CheckCircle, CalendarOff, Clock, Banknote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#7C3AED', '#EC4899'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" subtitle="Overview of your organization" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const attendanceTrend = (data?.attendance_trend || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    Present: parseInt(d.present),
    Absent: parseInt(d.absent),
    'On Leave': parseInt(d.on_leave),
  }));

  const deptData = (data?.department_headcount || []).map((d, i) => ({
    name: d.department,
    value: parseInt(d.count),
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Admin Dashboard" subtitle="Overview of your organization" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.active_employees || 0} icon={Users} color="blue" />
        <StatCard title="Present Today" value={data?.today_present || 0} icon={CheckCircle} color="green" />
        <StatCard title="On Leave Today" value={data?.today_on_leave || 0} icon={CalendarOff} color="amber" />
        <StatCard title="Pending Leaves" value={data?.pending_leave_requests || 0} icon={Clock} color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Present" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="On Leave" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {deptData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Payroll */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Monthly Payroll Cost</h3>
          <div className="flex items-center gap-2 text-emerald-400">
            <Banknote className="w-4 h-4" />
            <span className="text-lg font-bold">₹{(data?.monthly_payroll_cost || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
