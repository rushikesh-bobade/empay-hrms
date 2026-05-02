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

  if (loading) return <div className="space-y-6"><PageHeader title="HR Dashboard" /><div className="grid grid-cols-12 gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="col-span-3 skeleton h-36 rounded-2xl"/>)}</div></div>;

  return (
    <div className="space-y-5">
      <PageHeader title="HR Dashboard" subtitle="Overview of human resources metrics." />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Total Employees" value={data?.total_employees || 0} icon={Users} color="primary" /></div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Active Employees" value={data?.active_employees || 0} icon={CheckCircle} color="success" /></div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="On Leave Today" value={parseInt(data?.today_summary?.on_leave) || 0} icon={CalendarOff} color="warning" /></div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3"><StatCard title="Pending Leaves" value={data?.pending_leave_requests || 0} icon={Clock} color="danger" /></div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* On leave today */}
        <div className="col-span-12 lg:col-span-6 glass-panel rounded-2xl p-6 fade-in">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: '#dae2fd' }}>Employees On Leave Today</h3>
          {(data?.on_leave_today || []).length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: '#8c909f' }}>No employees on leave today</p>
          ) : (
            <div className="space-y-2">{data.on_leave_today.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(45, 52, 73, 1)', color: '#adc6ff' }}>
                  {emp.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div><p className="text-sm font-medium" style={{ color: '#dae2fd' }}>{emp.full_name}</p><p className="text-[0.7rem]" style={{ color: '#c2c6d6' }}>{emp.department} · {emp.designation}</p></div>
              </div>
            ))}</div>
          )}
        </div>

        {/* Recent leave requests */}
        <div className="col-span-12 lg:col-span-6 glass-panel rounded-2xl p-6 fade-in">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: '#dae2fd' }}>Recent Leave Requests</h3>
          <div className="space-y-2">
            {(data?.recent_leave_requests || []).slice(0, 8).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#dae2fd' }}>{r.full_name}</p>
                  <p className="text-[0.7rem]" style={{ color: '#c2c6d6' }}>{r.leave_type_name} · {r.total_days} day(s)</p>
                </div>
                <span className={`chip-${r.status} inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
