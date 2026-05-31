import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { CalendarCheck, UserX, Clock, CalendarOff } from 'lucide-react';

export default function HRAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get('/attendance/all', { params: { month, year } })
      .then(res => { setRecords(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month, year]);

  const summary = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    half_day: records.filter(r => r.status === 'half_day').length,
    on_leave: records.filter(r => r.status === 'on_leave').length,
  };

  const formatTime = (t) => t ? t.substring(0, 5) : '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Dashboard" subtitle="Track daily presence, hours, and history.">
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="input-glass px-3 py-2 text-sm rounded-xl">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="input-glass w-24 px-3 py-2 text-sm rounded-xl" />
        </div>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Present" value={summary.present} icon={CalendarCheck} color="success" />
        <StatCard title="Absent" value={summary.absent} icon={UserX} color="danger" />
        <StatCard title="Half Day" value={summary.half_day} icon={Clock} color="warning" />
        <StatCard title="On Leave" value={summary.on_leave} icon={CalendarOff} color="primary" />
      </div>
      <div className="glass-card overflow-hidden fade-in">
        <table className="w-full glass-table">
          <thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? Array.from({length:8}).map((_,i) => <tr key={i}>{Array.from({length:5}).map((_,j) => <td key={j}><div className="skeleton h-4 w-20 rounded"/></td>)}</tr>) :
            records.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant">No attendance records</td></tr> :
            records.map(r => (
              <tr key={r.id}>
                <td><div className="flex items-center gap-2"><span className="font-medium text-on-surface">{r.full_name}</span><span className="text-xs text-on-surface-variant">({r.department})</span></div></td>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{formatTime(r.check_in)}</td>
                <td>{formatTime(r.check_out)}</td>
                <td><span className={`chip-${r.status?.replace('_','-')} inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize`}>{r.status?.replace('_',' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}