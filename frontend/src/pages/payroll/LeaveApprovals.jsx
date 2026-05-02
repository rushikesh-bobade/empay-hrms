import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { Check, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '../../context/SocketContext';

export default function LeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { socket } = useSocket();

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/leave/requests/all', { params }).then(res => { setRequests(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchRequests();
    socket.on('leave_updated', handleUpdate);
    return () => socket.off('leave_updated', handleUpdate);
  }, [socket, fetchRequests]);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/leave/requests/${id}/${action}`);
      toast.success(`Leave ${action}d successfully`);
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Approvals" subtitle="Review and process leave requests." />

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' }].map(t => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === t.key ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden fade-in">
        <table className="w-full glass-table">
          <thead><tr><th>Employee</th><th>Department</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i) => <tr key={i}>{Array.from({length:9}).map((_,j) => <td key={j}><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>) :
            requests.length === 0 ? <tr><td colSpan={9} className="text-center py-12 text-on-surface-variant">No leave requests found</td></tr> :
            requests.map(r => (
              <tr key={r.id}>
                <td className="font-medium text-on-surface">{r.full_name}</td>
                <td className="text-on-surface-variant">{r.department}</td>
                <td>{r.leave_type_name}</td>
                <td>{new Date(r.start_date).toLocaleDateString()}</td>
                <td>{new Date(r.end_date).toLocaleDateString()}</td>
                <td>{r.total_days}</td>
                <td className="text-on-surface-variant max-w-[120px] truncate">{r.reason || '—'}</td>
                <td><span className={`chip-${r.status} inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize`}>{r.status}</span></td>
                <td>
                  {r.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleAction(r.id, 'approve')} className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleAction(r.id, 'reject')} className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"><XIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
