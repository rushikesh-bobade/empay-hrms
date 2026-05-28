import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { Users, CheckCircle, CalendarOff, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#4d8eff', '#a78bfa', '#4cd7f6', '#4ade80', '#fbbf24', '#f87171'];

function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 flex items-start justify-between fade-in" aria-hidden="true">
      <div className="flex-1">
        <div className="skeleton h-3 w-28 rounded mb-4" />
        <div className="skeleton h-8 w-20 rounded-lg mb-3" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-12 w-12 rounded-xl" />
    </div>
  );
}

function BarChartSkeleton() {
  return (
    <div className="glass-card p-5 fade-in" aria-hidden="true">
      <div className="skeleton h-6 w-44 rounded mb-6" />
      <div className="flex h-[280px] items-end gap-3 border-l border-b border-[var(--chart-grid)] px-4 pb-4">
        {[62, 82, 48, 76, 55, 88, 66].map((height, idx) => (
          <div key={idx} className="flex flex-1 items-end justify-center gap-1.5">
            <div className="skeleton w-full max-w-4 rounded-t-md" style={{ height: `${height}%` }} />
            <div className="skeleton w-full max-w-4 rounded-t-md" style={{ height: `${Math.max(height - 24, 22)}%` }} />
            <div className="skeleton w-full max-w-4 rounded-t-md" style={{ height: `${Math.max(height - 36, 16)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="skeleton h-3 w-3 rounded-full" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DepartmentChartSkeleton() {
  return (
    <div className="glass-card p-5 fade-in" aria-hidden="true">
      <div className="skeleton h-6 w-52 rounded mb-6" />
      <div className="flex h-[200px] items-center justify-center">
        <div className="skeleton h-36 w-36 rounded-full" />
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="skeleton h-2.5 w-2.5 rounded-full" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PayrollCostSkeleton() {
  return (
    <div className="glass-card p-5 fade-in" aria-hidden="true">
      <div className="mb-4 flex items-center justify-between">
        <div className="skeleton h-6 w-48 rounded" />
      </div>
      <div className="skeleton h-9 w-44 rounded-lg" />
      <div className="skeleton h-3 w-36 rounded mt-3" />
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <PageHeader title="Overview" subtitle="Welcome back, here's the latest HR data." />
      <span className="sr-only">Loading admin dashboard data</span>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <StatCardSkeleton key={idx} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <BarChartSkeleton />
        </div>
        <DepartmentChartSkeleton />
      </div>

      <PayrollCostSkeleton />
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const attendanceTrend = (data?.attendance_trend || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    Present: parseInt(d.present),
    Absent: parseInt(d.absent),
    'On Leave': parseInt(d.on_leave),
  }));

  const deptData = (data?.department_headcount || []).map(d => ({
    name: d.department,
    value: parseInt(d.count),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle="Welcome back, here's the latest HR data." />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Employees" value={data?.total_employees || 0} icon={Users} color="primary" trend="+2.4%" />
        <StatCard title="Present Today" value={data?.today_present || 0} icon={CheckCircle} color="success" subtitle={`${((data?.today_present / (data?.active_employees || 1)) * 100).toFixed(1)}% Rate`} />
        <StatCard title="On Leave Today" value={data?.today_on_leave || 0} icon={CalendarOff} color="warning" />
        <StatCard title="Pending Leaves" value={data?.pending_leave_requests || 0} icon={Clock} color="danger" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-5 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceTrend}>
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

        <div className="glass-card p-5 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {deptData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '12px', color: 'var(--chart-tooltip-color)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {deptData.map((d, idx) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payroll Cost */}
      <div className="glass-card p-5 fade-in">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-on-surface">Monthly Payroll Cost</h3>
        </div>
        <p className="text-3xl font-bold text-primary">₹{(data?.monthly_payroll_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        <p className="text-xs text-on-surface-variant mt-1">Current month total net pay</p>
      </div>
    </div>
  );
}
