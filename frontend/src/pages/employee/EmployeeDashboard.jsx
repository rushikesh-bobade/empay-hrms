import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import { CalendarCheck, CalendarOff, Banknote, LogIn, LogOut, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const chartData = [...(data?.recent_attendance || [])].reverse().map(d => {
    let hours = 0;
    if (d.check_in) {
      let inTime = new Date(`2024-01-01T${d.check_in}`);
      let outTime;

      if (d.check_out) {
        outTime = new Date(`2024-01-01T${d.check_out}`);
      } else {
        const recordDateStr = new Date(d.date).toLocaleDateString();
        const todayStr = new Date().toLocaleDateString();
        if (recordDateStr === todayStr) {
          outTime = new Date(`2024-01-01T${currentTime.toTimeString().split(' ')[0]}`);
        }
      }

      if (outTime) {
        if (outTime < inTime) outTime.setDate(outTime.getDate() + 1);
        hours = parseFloat(((outTime - inTime) / 3600000).toFixed(2));
      }
    }
    return {
      date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      hours
    };
  });

  if (loading) return <div className="space-y-6"><div className="skeleton h-10 w-64 rounded-xl" /><div className="grid grid-cols-12 gap-5">{Array.from({length:4}).map((_,i)=><div key={i} className="col-span-3 skeleton h-36 rounded-2xl" />)}</div></div>;

  const att = data?.attendance_this_month || {};

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em]" style={{ color: 'var(--t-on-surface)' }}>{getGreeting()}, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-base mt-1" style={{ color: 'var(--t-on-surface-variant)' }}>Here's an overview of your workday.</p>
        </div>
        <div className="glass-panel px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2" style={{ color: 'var(--t-on-surface)' }}>
          <CalendarCheck className="w-4 h-4 text-[#adc6ff]" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Check In/Out + Stats — Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6 glass-panel rounded-2xl p-6 fade-in relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 blur-2xl rounded-full" style={{ background: isCheckedIn ? 'rgba(74, 222, 128, 0.2)' : 'rgba(77, 142, 255, 0.2)' }} />
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex-1">
              {isCheckedIn && <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#4ade80' }}><span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" /> CHECKED IN</p>}
              {isCheckedOut && <p className="text-xs font-semibold mb-1" style={{ color: 'var(--t-on-surface-variant)' }}>CHECKED OUT</p>}
              {!todayAtt && <p className="text-xs font-semibold mb-1" style={{ color: '#fbbf24' }}>NOT CHECKED IN</p>}
              {todayAtt?.check_in && <p className="text-4xl font-bold" style={{ color: 'var(--t-on-surface)' }}>{todayAtt.check_in.substring(0, 5)}</p>}
            </div>
            <button onClick={handleMark} disabled={marking} className="btn-glow flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: isCheckedIn ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : isCheckedIn ? <><LogOut className="w-4 h-4" /> Check Out</> : <><LogIn className="w-4 h-4" /> Check In</>}
            </button>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard title="Present Days" value={parseInt(att.present) || 0} icon={CalendarCheck} color="success" subtitle={`of ${att.total_working_days || 0} days`} />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard title="On Leave" value={parseInt(att.on_leave) || 0} icon={CalendarOff} color="primary" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Chart — 8 columns */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 fade-in">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--t-on-surface)' }}>Hours Logged This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-table-border)" />
              <XAxis dataKey="date" stroke="var(--t-outline)" fontSize={12} />
              <YAxis stroke="var(--t-outline)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--t-panel-elevated-bg)', border: '1px solid var(--t-glass-border)', borderRadius: '12px', color: 'var(--t-on-surface)', backdropFilter: 'blur(12px)' }} />
              <Bar dataKey="hours" fill="#adc6ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Balance — 4 columns */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 fade-in">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--t-on-surface)' }}>Leave Balance</h3>
          <div className="space-y-4">
            {(data?.leave_balance || []).map(lb => {
              const pct = lb.allocated > 0 ? ((lb.used / lb.allocated) * 100) : 0;
              const colors = { 'Casual Leave': '#adc6ff', 'Sick Leave': '#f87171', 'Earned Leave': '#4cd7f6' };
              return (
                <div key={lb.leave_type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm" style={{ color: 'var(--t-on-surface-variant)' }}>{lb.leave_type}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--t-on-surface)' }}>{lb.used} <span style={{ color: 'var(--t-on-surface-variant)', fontWeight: 400 }}>/ {lb.allocated} used</span></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: colors[lb.leave_type] || '#adc6ff' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Last Payslip */}
      {data?.last_payslip && (
        <div className="glass-panel rounded-2xl p-6 fade-in relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 blur-2xl rounded-full" style={{ background: 'rgba(77, 142, 255, 0.15)' }} />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.05em] font-semibold mb-1" style={{ color: 'var(--t-on-surface-variant)' }}>Last Salary</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--t-on-surface)' }}>₹{parseFloat(data.last_payslip.net_pay).toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--t-on-surface-variant)' }}>Credited for {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][data.last_payslip.month - 1]} {data.last_payslip.year}</p>
            </div>
            <Banknote className="w-10 h-10 opacity-20" style={{ color: '#adc6ff' }} />
          </div>
        </div>
      )}
    </div>
  );
}
