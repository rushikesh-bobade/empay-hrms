import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { Users, CheckCircle, CalendarOff, Clock, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#adc6ff', '#d0bcff', '#4cd7f6', '#4ade80', '#fbbf24', '#f87171'];

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
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" subtitle="Welcome back, here's the latest HR data." />
        <div className="grid grid-cols-12 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="col-span-12 md:col-span-6 lg:col-span-3 skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
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

  const recentLeaves = data?.recent_leave_requests || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Overview" subtitle="Welcome back, here's the latest HR data."
        action={
          <button className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors text-[#adc6ff] text-xs font-semibold uppercase tracking-[0.05em]">
            <Download className="w-4 h-4" /> Export Report
          </button>
        }
      />

      {/* Bento Grid — 12 column */}
      <div className="grid grid-cols-12 gap-5">
        {/* KPI Cards */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard title="Total Employees" value={data?.total_employees || 0} icon={Users} color="primary" trend="+2.4%" />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard title="Present Today" value={data?.today_present || 0} icon={CheckCircle} color="success" subtitle={`${((data?.today_present / (data?.active_employees || 1)) * 100).toFixed(1)}% Rate`} />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard title="On Leave Today" value={data?.today_on_leave || 0} icon={CalendarOff} color="purple" />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard title="Pending Leaves" value={data?.pending_leave_requests || 0} icon={Clock} color="warning" />
        </div>

        {/* Attendance Trends Chart — 8 columns */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--t-on-surface)' }}>Attendance Trends</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded-full bg-[#adc6ff]/20 text-[#adc6ff] border border-[#adc6ff]/30 font-semibold">Week</button>
              <button className="px-3 py-1 text-xs rounded-full hover:bg-white/5 text-[#c2c6d6] transition-colors font-medium">Month</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-table-border)" />
              <XAxis dataKey="date" stroke="var(--t-outline)" fontSize={12} />
              <YAxis stroke="var(--t-outline)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--t-panel-elevated-bg)', border: '1px solid var(--t-glass-border)', borderRadius: '12px', color: 'var(--t-on-surface)', backdropFilter: 'blur(10px)' }} />
              <Legend />
              <Bar dataKey="Present" fill="#adc6ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="On Leave" fill="#d0bcff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution — 4 columns */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 fade-in flex flex-col">
          <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--t-on-surface)' }}>Department Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                  label={({ value }) => `${value}`} stroke="none">
                  {deptData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--t-panel-elevated-bg)', border: '1px solid var(--t-glass-border)', borderRadius: '12px', color: 'var(--t-on-surface)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {deptData.map((d, idx) => (
              <div key={d.name} className="flex items-center gap-2 text-xs" style={{ color: 'var(--t-on-surface-variant)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leave Requests — full width glass table */}
        <div className="col-span-12 glass-panel rounded-2xl overflow-hidden fade-in">
          <div className="p-6 flex justify-between items-center" style={{ background: 'var(--t-panel-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--t-table-border)' }}>
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--t-on-surface)' }}>Recent Leave Requests</h3>
            <button className="text-xs font-semibold uppercase tracking-[0.05em] text-[#adc6ff] hover:text-[#d8e2ff] transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[0.7rem] uppercase tracking-[0.05em] font-semibold" style={{ color: 'var(--t-on-surface-variant)', borderBottom: '1px solid var(--t-table-border)' }}>
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Leave Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Applied On</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm" style={{ color: 'var(--t-on-surface)' }}>
                {recentLeaves.length > 0 ? recentLeaves.map((req, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--t-icon-box-bg)', color: PIE_COLORS[i % PIE_COLORS.length] }}>
                        {req.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{req.full_name}</p>
                        <p className="text-[0.7rem]" style={{ color: 'var(--t-on-surface-variant)' }}>{req.department}</p>
                      </div>
                    </td>
                    <td className="p-4">{req.leave_type}</td>
                    <td className="p-4">{new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="p-4" style={{ color: 'var(--t-on-surface-variant)' }}>{new Date(req.applied_at || req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium chip-${req.status}`}>
                        {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm" style={{ color: 'var(--t-outline)' }}>No recent leave requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Payroll Cost */}
        <div className="col-span-12 glass-panel rounded-2xl p-6 fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--t-on-surface)' }}>Monthly Payroll Cost</h3>
          </div>
          <p className="text-4xl font-bold text-[#3b82f6]">₹{(data?.monthly_payroll_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--t-on-surface-variant)' }}>Current month total net pay</p>
        </div>
      </div>
    </div>
  );
}
