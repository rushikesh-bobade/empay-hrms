import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { CalendarCheck, UserX, Clock, CalendarOff, CalendarX } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/attendance/my', { params: { month, year } }),
      api.get('/attendance/monthly-summary', { params: { month, year } }),
    ]).then(([attRes, sumRes]) => {
      setRecords(attRes.data.data);
      setSummary(sumRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month, year]);

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const recordMap = {};
  records.forEach(r => { recordMap[new Date(r.date).getDate()] = r; });

  const statusColors = { present: '#4ade80', absent: '#f87171', half_day: '#fbbf24', on_leave: '#60a5fa' };

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" subtitle="Track your daily presence and history.">
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="input-glass px-3 py-2 text-sm rounded-xl">
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="input-glass w-24 px-3 py-2 text-sm rounded-xl" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard title="Present" value={parseInt(summary.present) || 0} icon={CalendarCheck} color="success" />
        <StatCard title="Absent" value={parseInt(summary.absent) || 0} icon={UserX} color="danger" />
        <StatCard title="Half Day" value={parseInt(summary.half_day) || 0} icon={Clock} color="warning" />
        <StatCard title="On Leave" value={parseInt(summary.on_leave) || 0} icon={CalendarOff} color="primary" />
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-2xl p-6">
        {!loading && records.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No attendance records"
            message="No attendance data found for the selected month and year."
          />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-on-surface-variant py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: (firstDay === 0 ? 6 : firstDay - 1) }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const record = recordMap[day];
                const dayOfWeek = new Date(year, month - 1, day).getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isFuture = new Date(year, month - 1, day) > new Date();
                const bg = isFuture ? 'transparent' : record ? `${statusColors[record.status]}20` : isWeekend ? 'var(--glass-bg)' : `${statusColors.absent}20`;
                const border = record ? `1px solid ${statusColors[record.status]}40` : (!isWeekend && !isFuture) ? `1px solid ${statusColors.absent}40` : '1px solid transparent';

                return (
                  <div key={day} className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all hover:scale-105 cursor-default group relative" style={{ background: bg, border }}>
                    <span className={`font-medium ${(!record && isWeekend) ? 'text-on-surface-variant/40' : 'text-on-surface'}`}>{day}</span>
                    {record && <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: statusColors[record.status] }} />}
                    {record && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass-panel-elevated px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                        <p className="capitalize font-medium">{record.status?.replace('_', ' ')}</p>
                        {record.check_in && <p className="text-on-surface-variant">In: {record.check_in.substring(0, 5)}</p>}
                        {record.check_out && <p className="text-on-surface-variant">Out: {record.check_out.substring(0, 5)}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 justify-center">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <div className="w-3 h-3 rounded" style={{ background: `${color}30`, border: `1px solid ${color}50` }} />
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}