import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import StatCard from '../../components/shared/StatCard';
import { CheckCircle, XCircle, Clock, CalendarOff } from 'lucide-react';

export default function HRAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({ present: 0, absent: 0, half_day: 0, on_leave: 0 });

  useEffect(() => {
    setLoading(true);
    api.get(`/attendance/all?month=${month}&year=${year}`)
      .then(res => {
        const data = res.data.data;
        setRecords(data);
        setSummary({
          present: data.filter(r => r.status === 'present').length,
          absent: data.filter(r => r.status === 'absent').length,
          half_day: data.filter(r => r.status === 'half_day').length,
          on_leave: data.filter(r => r.status === 'on_leave').length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  const columns = [
    {
      header: 'Employee', cell: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.full_name}</p>
          <p className="text-xs text-slate-500">{row.department}</p>
        </div>
      ),
    },
    { header: 'Date', cell: (row) => new Date(row.date).toLocaleDateString('en-IN') },
    { header: 'Check In', cell: (row) => row.check_in || '—' },
    { header: 'Check Out', cell: (row) => row.check_out || '—' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Attendance Records" subtitle="Monitor employee attendance">
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2024, i).toLocaleString('en', { month: 'long' })}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Present" value={summary.present} icon={CheckCircle} color="green" />
        <StatCard title="Absent" value={summary.absent} icon={XCircle} color="red" />
        <StatCard title="Half Day" value={summary.half_day} icon={Clock} color="amber" />
        <StatCard title="On Leave" value={summary.on_leave} icon={CalendarOff} color="blue" />
      </div>

      <DataTable columns={columns} data={records} searchKey="full_name" isLoading={loading} searchPlaceholder="Search by employee name..." />
    </div>
  );
}
