import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/leave/requests/all' : `/leave/requests/all?status=${filter}`;
      const res = await api.get(url);
      setRequests(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) return;
    try {
      await api.patch(`/leave/requests/${id}/approve`);
      fetchRequests();
    } catch (err) { alert(err.response?.data?.message || 'Failed to approve'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this leave request?')) return;
    try {
      await api.patch(`/leave/requests/${id}/reject`);
      fetchRequests();
    } catch (err) { alert(err.response?.data?.message || 'Failed to reject'); }
  };

  const columns = [
    { header: 'Employee', cell: (row) => <div><p className="text-sm font-medium text-white">{row.employee_name}</p><p className="text-xs text-slate-500">{row.department}</p></div> },
    { header: 'Leave Type', accessorKey: 'leave_type_name' },
    { header: 'Start', cell: (row) => new Date(row.start_date).toLocaleDateString('en-IN') },
    { header: 'End', cell: (row) => new Date(row.end_date).toLocaleDateString('en-IN') },
    { header: 'Days', accessorKey: 'total_days' },
    { header: 'Reason', cell: (row) => <span className="truncate max-w-[150px] block text-slate-400">{row.reason}</span> },
    { header: 'Applied', cell: (row) => new Date(row.created_at).toLocaleDateString('en-IN') },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions', cell: (row) => row.status === 'pending' ? (
        <div className="flex items-center gap-2">
          <button onClick={() => handleApprove(row.id)} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Approve">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button onClick={() => handleReject(row.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Reject">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ) : '—',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Leave Approvals" subtitle="Review and process leave requests" />

      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 w-fit">
        {['all', 'pending', 'approved', 'rejected'].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${filter === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={requests} searchKey="employee_name" isLoading={loading} searchPlaceholder="Search by employee..." />
    </div>
  );
}
