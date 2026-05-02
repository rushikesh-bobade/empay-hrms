import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { CheckCircle, XCircle, Clock, CalendarOff } from 'lucide-react';

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/attendance/my?month=${month}&year=${year}`),
      api.get(`/attendance/monthly-summary?month=${month}&year=${year}`),
    ]).then(([rRes, sRes]) => {
      setRecords(rRes.data.data);
      setSummary(sRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [month, year]);

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month-1, 1).getDay();
  const recordMap = {};
  records.forEach(r => { recordMap[new Date(r.date).getDate()] = r; });
  const today = new Date();

  const statusColors = { present:'bg-emerald-500/30 border-emerald-500/40 text-emerald-300', absent:'bg-red-500/30 border-red-500/40 text-red-300', half_day:'bg-amber-500/30 border-amber-500/40 text-amber-300', on_leave:'bg-blue-500/30 border-blue-500/40 text-blue-300' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="My Attendance" subtitle="View your attendance records">
        <div className="flex items-center gap-3">
          <select value={month} onChange={e=>setMonth(parseInt(e.target.value))} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
            {Array.from({length:12},(_,i)=><option key={i} value={i+1}>{new Date(2024,i).toLocaleString('en',{month:'long'})}</option>)}
          </select>
          <input type="number" value={year} onChange={e=>setYear(parseInt(e.target.value))} className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"/>
        </div>
      </PageHeader>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Present" value={parseInt(summary.present)||0} icon={CheckCircle} color="green"/>
          <StatCard title="Absent" value={parseInt(summary.absent)||0} icon={XCircle} color="red"/>
          <StatCard title="Half Day" value={parseInt(summary.half_day)||0} icon={Clock} color="amber"/>
          <StatCard title="On Leave" value={parseInt(summary.on_leave)||0} icon={CalendarOff} color="blue"/>
        </div>
      )}

      {/* Calendar grid */}
      <div className="glass-card rounded-xl p-5">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
            <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for offset (adjust Sun=0 to Mon=0) */}
          {Array.from({length:(firstDayOfWeek+6)%7}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day = i+1;
            const d = new Date(year, month-1, day);
            const isWeekend = d.getDay()===0 || d.getDay()===6;
            const isFuture = d > today;
            const rec = recordMap[day];
            const status = rec?.status;

            return (
              <div key={day} className={`relative p-2 rounded-lg text-center text-sm border transition-colors cursor-default
                ${isWeekend ? 'bg-slate-800/30 border-slate-800 text-slate-600' :
                  isFuture ? 'border-slate-800 text-slate-600' :
                  status ? statusColors[status] || 'border-slate-800 text-slate-400' :
                  'border-slate-800 text-slate-400'}`}
                title={rec ? `${status} | In: ${rec.check_in||'-'} | Out: ${rec.check_out||'-'}` : isWeekend ? 'Weekend' : ''}>
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/30"/>Present</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/30"/>Absent</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500/30"/>Half Day</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500/30"/>On Leave</div>
        </div>
      </div>
    </div>
  );
}
