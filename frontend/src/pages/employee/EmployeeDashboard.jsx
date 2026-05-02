import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import PageHeader from '../../components/shared/PageHeader';
import { CalendarCheck, CalendarOff, Banknote, Clock, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/employee'),
      api.get('/attendance/today-status'),
    ]).then(([dashRes, statusRes]) => {
      setData(dashRes.data.data);
      setTodayStatus(statusRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleMark = async () => {
    setMarking(true);
    try {
      const res = await api.post('/attendance/mark');
      setTodayStatus(res.data.data.record);
      // Refresh dashboard
      const dashRes = await api.get('/dashboard/employee');
      setData(dashRes.data.data);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setMarking(false); }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const hasCheckedIn = todayStatus?.check_in;
  const hasCheckedOut = todayStatus?.check_out;

  const recentChart = (data?.recent_attendance || []).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    value: d.status === 'present' ? 1 : d.status === 'half_day' ? 0.5 : 0,
    status: d.status,
  }));

  if (loading) return <div className="space-y-6"><div className="h-10 bg-slate-800/50 rounded animate-pulse w-64" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-28 bg-slate-800/50 rounded-xl animate-pulse"/>)}</div></div>;

  const att = data?.attendance_this_month || {};
  const totalLeaveUsed = (data?.leave_balance||[]).reduce((s,b)=>s+b.used_days,0);
  const totalLeaveRemaining = (data?.leave_balance||[]).reduce((s,b)=>s+(b.allocated_days-b.used_days),0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{getGreeting()}, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-sm text-slate-400 mt-1">Here's your overview for today</p>
        </div>
        <button onClick={handleMark} disabled={marking || hasCheckedOut}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${hasCheckedOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : hasCheckedIn ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}`}>
          {marking ? <Loader2 className="w-4 h-4 animate-spin"/> : <Clock className="w-4 h-4"/>}
          {hasCheckedOut ? `Checked out` : hasCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {todayStatus && (
        <div className="glass-card rounded-xl p-4 flex items-center gap-4">
          <StatusBadge status={todayStatus.status || 'absent'} />
          {todayStatus.check_in && <span className="text-sm text-slate-400">Checked in at <span className="text-white">{todayStatus.check_in}</span></span>}
          {todayStatus.check_out && <span className="text-sm text-slate-400">Checked out at <span className="text-white">{todayStatus.check_out}</span></span>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present This Month" value={parseInt(att.present)||0} icon={CalendarCheck} color="green" subtitle={`of ${att.total_working_days} working days`} />
        <StatCard title="Leaves Taken" value={totalLeaveUsed} icon={CalendarOff} color="amber" />
        <StatCard title="Leave Balance" value={totalLeaveRemaining} icon={Clock} color="blue" />
        <StatCard title="Last Net Pay" value={data?.last_payslip ? `₹${parseFloat(data.last_payslip.net_pay).toLocaleString('en-IN')}` : '—'} icon={Banknote} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Attendance (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recentChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="date" tick={{fontSize:12,fill:'#94a3b8'}}/>
              <YAxis domain={[0,1]} tick={{fontSize:12,fill:'#94a3b8'}} ticks={[0,0.5,1]}/>
              <Tooltip contentStyle={{backgroundColor:'#0f172a',border:'1px solid #1e293b',borderRadius:'8px',color:'#fff'}}/>
              <Bar dataKey="value" fill="#22C55E" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {(data?.leave_balance||[]).map(lb => {
              const remaining = lb.allocated_days - lb.used_days;
              const pct = lb.allocated_days > 0 ? (lb.used_days/lb.allocated_days)*100 : 0;
              return (
                <div key={lb.leave_type_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{lb.leave_type_name}</span>
                    <span className="text-xs text-slate-500">{lb.used_days}/{lb.allocated_days} used</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{remaining} remaining</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
