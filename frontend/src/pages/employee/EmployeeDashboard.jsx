import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import { CalendarCheck, CalendarOff, LogIn, LogOut, Loader2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [viewMode, setViewMode] = useState('yearly');
  const [elapsed, setElapsed] = useState('00:00:00');
  const timerRef = useRef(null);

  const fetchData = () => {
    api.get('/dashboard/employee').then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  // Live timer: tick every second while checked in
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const todayAtt = data?.today_attendance;
    const isCheckedIn = todayAtt && todayAtt.check_in && !todayAtt.check_out;

    if (isCheckedIn) {
      const tick = () => {
        const [h, m, s] = todayAtt.check_in.split(':').map(Number);
        const checkInDate = new Date();
        checkInDate.setHours(h, m, s, 0);
        const currentSessionSeconds = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000));
        const accumulatedSeconds = (todayAtt.accumulated_minutes || 0) * 60;
        const diff = currentSessionSeconds + accumulatedSeconds;
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        setElapsed(`${hrs}:${mins}:${secs}`);
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      // If checked out, show the total worked time
      if (todayAtt && todayAtt.check_in && todayAtt.check_out) {
        const [h1, m1, s1] = todayAtt.check_in.split(':').map(Number);
        const [h2, m2, s2] = todayAtt.check_out.split(':').map(Number);
        const currentSessionSeconds = (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
        const accumulatedSeconds = (todayAtt.accumulated_minutes || 0) * 60;
        const diff = Math.max(0, currentSessionSeconds) + accumulatedSeconds;
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        setElapsed(`${hrs}:${mins}:${secs}`);
      } else {
        setElapsed('00:00:00');
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [data]);

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

  // Build chart data including today's live hours
  const buildChartData = () => {
    const records = data?.recent_attendance || [];
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    
    // Generate the last 7 days ending today
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push(d);
    }

    return last7Days.map(dateObj => {
      const dateStr = dateObj.toLocaleDateString('en-CA');
      const isToday = dateStr === todayStr;
      
      // Find record for this day
      let d = records.find(r => new Date(r.date).toLocaleDateString('en-CA') === dateStr);
      
      // Fallback to today_attendance if it's today and not in recent_attendance
      if (isToday && !d && todayAtt && todayAtt.check_in) {
        d = todayAtt;
      }

      let hours = 0;
      if (d) {
        if (d.check_in && d.check_out) {
          hours = parseFloat(((new Date(`2024-01-01T${d.check_out}`) - new Date(`2024-01-01T${d.check_in}`)) / 3600000).toFixed(1));
        } else if (isToday && d.check_in && !d.check_out) {
          const [h, m, s] = d.check_in.split(':').map(Number);
          const checkInDate = new Date();
          checkInDate.setHours(h, m, s, 0);
          hours = parseFloat(((Date.now() - checkInDate.getTime()) / 3600000).toFixed(1));
        }
      }

      return {
        date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        hours,
        isToday,
      };
    });
  };

  const chartData = buildChartData();

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
              {todayAtt?.check_in && (
                <div>
                  <p className="text-lg font-bold text-on-surface">{todayAtt.check_in.substring(0, 5)}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {isCheckedIn ? <span className="text-success font-medium">{elapsed}</span> : <span>{elapsed}</span>}
                    {isCheckedIn && <span className="text-[10px]">elapsed</span>}
                    {isCheckedOut && <span className="text-[10px]">total</span>}
                  </p>
                </div>
              )}
            </div>
            <button 
              onClick={handleMark} 
              disabled={marking || isCheckedOut} 
              className={`btn-glow flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all`}
              style={{ background: isCheckedOut ? 'linear-gradient(135deg, #6b7280, #4b5563)' : isCheckedIn ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #4d8eff, #571bc1)' }}>
              {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : 
               isCheckedOut ? <><CalendarCheck className="w-4 h-4" /> Finished</> :
               isCheckedIn ? <><LogOut className="w-4 h-4" /> Check Out</> : 
               <><LogIn className="w-4 h-4" /> Check In</>}
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={12} />
              <YAxis stroke="var(--chart-axis)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '12px', color: 'var(--chart-tooltip-color)' }}
                formatter={(value, name, props) => [`${value} hrs${props.payload.isToday && isCheckedIn ? ' (live)' : ''}`, 'Hours']} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="#4d8eff" />
              <defs>
                <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#4d8eff" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Balance (Monthly) */}
        <div className="glass-card p-5 fade-in">
          <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wider flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-primary" /> Monthly Leave Balance
          </h3>
          <div className="space-y-4">
            {(data?.leave_balance || [])
              .filter(lb => lb.allocated > 0)
              .map(lb => {
                const allocated = parseFloat((lb.allocated / 12).toFixed(1));
                const used = lb.used_this_month || 0;
                const pct = allocated > 0 ? (used / allocated * 100) : 0;
                const colors = { 'Casual Leave': '#4d8eff', 'Sick/Medical Leave': '#f87171', 'Earned/Privilege Leave': '#4cd7f6' };
                return (
                  <div key={lb.leave_type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-on-surface-variant">{lb.leave_type}</span>
                      <span className="text-xs font-bold text-on-surface">{used} <span className="text-on-surface-variant font-normal">/ {allocated} used</span></span>
                    </div>
                    <div className="progress-bar h-1.5 bg-surface-variant/20">
                      <div className="progress-bar-fill shadow-[0_0_8px_rgba(77,142,255,0.2)] transition-all duration-500" style={{ width: `${Math.min(Math.max(0, pct), 100)}%`, background: colors[lb.leave_type] || '#4d8eff' }} />
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
