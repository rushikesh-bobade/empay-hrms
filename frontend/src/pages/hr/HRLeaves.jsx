import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { Plus, X } from 'lucide-react';

export default function HRLeaves() {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showAllocDialog, setShowAllocDialog] = useState(false);
  const [allocForm, setAllocForm] = useState({ employee_id: '', leave_type_id: '', allocated_days: '', year: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/leave/requests/all'),
      api.get('/users'),
      api.get('/leave/types'),
    ]).then(([reqRes, usersRes, typesRes]) => {
      setRequests(reqRes.data.data);
      setEmployees(usersRes.data.data);
      setLeaveTypes(typesRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fetchAllocations = async (empId) => {
    if (!empId) return;
    setSelectedEmployee(empId);
    try {
      const res = await api.get(`/leave/allocation/${empId}`);
      setAllocations(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/leave/allocation', allocForm);
      setShowAllocDialog(false);
      if (selectedEmployee) fetchAllocations(selectedEmployee);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const requestColumns = [
    { header: 'Employee', cell: (row) => <div><p className="text-sm font-medium text-white">{row.employee_name}</p><p className="text-xs text-slate-500">{row.department}</p></div> },
    { header: 'Type', accessorKey: 'leave_type_name' },
    { header: 'Start', cell: (row) => new Date(row.start_date).toLocaleDateString('en-IN') },
    { header: 'End', cell: (row) => new Date(row.end_date).toLocaleDateString('en-IN') },
    { header: 'Days', accessorKey: 'total_days' },
    { header: 'Reason', cell: (row) => <span className="truncate max-w-[150px] block">{row.reason}</span> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Applied', cell: (row) => new Date(row.created_at).toLocaleDateString('en-IN') },
  ];

  const allocColumns = [
    { header: 'Leave Type', accessorKey: 'leave_type_name' },
    { header: 'Allocated', accessorKey: 'allocated_days' },
    { header: 'Used', accessorKey: 'used_days' },
    { header: 'Remaining', cell: (row) => <span className={`font-medium ${row.remaining <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>{row.remaining}</span> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Leave Management" subtitle="View leave requests and manage allocations" />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 w-fit">
        {['requests', 'allocations'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t === 'requests' ? 'Leave Requests' : 'Leave Allocations'}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <DataTable columns={requestColumns} data={requests} searchKey="employee_name" isLoading={loading} searchPlaceholder="Search by employee name..." />
      )}

      {tab === 'allocations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select value={selectedEmployee} onChange={e => fetchAllocations(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
            <button onClick={() => setShowAllocDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Allocate Leave
            </button>
          </div>

          {selectedEmployee && <DataTable columns={allocColumns} data={allocations} isLoading={false} />}

          {showAllocDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Allocate Leave</h2>
                  <button onClick={() => setShowAllocDialog(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAllocate} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Employee</label>
                    <select value={allocForm.employee_id} onChange={e => setAllocForm({ ...allocForm, employee_id: e.target.value })} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
                      <option value="">Select</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Leave Type</label>
                    <select value={allocForm.leave_type_id} onChange={e => setAllocForm({ ...allocForm, leave_type_id: e.target.value })} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
                      <option value="">Select</option>
                      {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Days</label>
                    <input type="number" value={allocForm.allocated_days} onChange={e => setAllocForm({ ...allocForm, allocated_days: e.target.value })} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowAllocDialog(false)} className="px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Allocate'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
