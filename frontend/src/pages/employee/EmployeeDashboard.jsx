import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import { CalendarCheck, CalendarOff, LogIn, LogOut, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchData = () => {
    api.get('/dashboard/employee').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleMark = async () => {
    setMarking(true);
    try {
      const res = await api.post('/attendance/mark');
      toast.success(res.data.message);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setMarking(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayAtt = data?.today_attendance;
  const isCheckedIn = todayAtt && todayAtt.check_in && !todayAtt.check_out;
  const isCheckedOut = todayAtt && todayAtt.check_out;

  const chartData = (data?.recent_attendance || []).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: d.check_in && d.check_out ? ((new Date(`2024-01-01T${d.check_out}`) - new Date(`2024-01-01T${d.check_in}`)) / 3600000).toFixed(1) : 0,
  }));

  if (loading) return <div className="space-y-6"><div className="skeleton h-10 w-64 rounded-xl" /><div className="grid grid-cols-4 gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-32 rounded-2xl" />)}</div></div>;

  const att = data?.attendance_this_month || {};

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-on-surface">{getGreeting()}, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-sm text-on-surface-variant mt-1">Here's an overview of your workday.</p></div>
        <div className="glass-card px-4 py-2 text-sm font-medium text-on-surface flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-primary" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Check In/Out + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2 glass-card p-5 fade-in">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {isCheckedIn && <p className="text-xs text-success font-semibold mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success pulse-dot" /> CHECKED IN</p>}
              {isCheckedOut && <p className="text-xs text-on-surface-variant font-semibold mb-1">CHECKED OUT</p>}
              {!todayAtt && <p className="text-xs text-warning font-semibold mb-1">NOT CHECKED IN</p>}
              {todayAtt?.check_in && <p className="text-lg font-bold text-on-surface">{todayAtt.check_in.substring(0, 5)}</p>}
            </div>
            <button onClick={handleMark} disabled={marking || isCheckedOut} className={`btn-glow flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all`}
              style={{ background: isCheckedIn ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
              {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : isCheckedIn ? <><LogOut className="w-4 h-4" /> Check Out</> : <><LogIn className="w-4 h-4" /> Check In</>}
            </button>
          </div>
        </div>
        <StatCard title="Present Days" value={parseInt(att.present) || 0} icon={CalendarCheck} color="success" subtitle={`of ${att.total_working_days || 0} days`} />
        <StatCard title="On Leave" value={parseInt(att.on_leave) || 0} icon={CalendarOff} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-5 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Hours Logged This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#8c909f" fontSize={12} />
              <YAxis stroke="#8c909f" fontSize={12} />
              <Tooltip contentStyle={{ background: '#171f33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#dae2fd' }} />
              <Bar dataKey="hours" fill="#4d8eff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Balance */}
        <div className="glass-card p-5 fade-in">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {(data?.leave_balance || []).map(lb => {
              const pct = lb.allocated > 0 ? ((lb.used / lb.allocated) * 100) : 0;
              const colors = { 'Casual Leave': '#4d8eff', 'Sick Leave': '#f87171', 'Earned Leave': '#4cd7f6' };
              return (
                <div key={lb.leave_type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-on-surface-variant">{lb.leave_type}</span>
                    <span className="text-sm font-semibold text-on-surface">{lb.used} <span className="text-on-surface-variant font-normal">/ {lb.allocated} used</span></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: colors[lb.leave_type] || '#4d8eff' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
