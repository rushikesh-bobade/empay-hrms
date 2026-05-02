import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import { Plus, Edit, X } from 'lucide-react';

export default function SalaryStructures() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ employee_id:'', basic_salary:'', hra_percent:40, special_allowance:'', effective_from:'' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [sRes, eRes] = await Promise.all([api.get('/payroll/salary-structure'), api.get('/users')]);
      setStructures(sRes.data.data);
      setEmployees(eRes.data.data);
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetchData();},[]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/payroll/salary-structure', form); setShowDialog(false); fetchData(); }
    catch(err){alert(err.response?.data?.message||'Failed');}
    finally{setSaving(false);}
  };

  const handleEdit = (row) => {
    setForm({ employee_id:row.employee_id, basic_salary:row.basic_salary, hra_percent:row.hra_percent, special_allowance:row.special_allowance, effective_from:row.effective_from?.split('T')[0]||'' });
    setShowDialog(true);
  };

  const columns = [
    { header:'Employee', cell:(r)=><div><p className="text-sm font-medium text-white">{r.full_name}</p><p className="text-xs text-slate-500">{r.department}</p></div> },
    { header:'Basic Salary', cell:(r)=>`₹${parseFloat(r.basic_salary).toLocaleString('en-IN')}` },
    { header:'HRA %', cell:(r)=>`${r.hra_percent}%` },
    { header:'Special Allowance', cell:(r)=>`₹${parseFloat(r.special_allowance).toLocaleString('en-IN')}` },
    { header:'Effective From', cell:(r)=>r.effective_from ? new Date(r.effective_from).toLocaleDateString('en-IN') : '—' },
    { header:'Actions', cell:(r)=><button onClick={()=>handleEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></button> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Salary Structures" subtitle="Manage employee compensation">
        <button onClick={()=>{setForm({employee_id:'',basic_salary:'',hra_percent:40,special_allowance:'',effective_from:''});setShowDialog(true);}} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4"/>Set Salary</button>
      </PageHeader>
      <DataTable columns={columns} data={structures} searchKey="full_name" isLoading={loading} searchPlaceholder="Search employee..."/>
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Set Salary Structure</h2>
              <button onClick={()=>setShowDialog(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Employee</label>
                <select value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="">Select</option>{employees.map(e=><option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select></div>
              <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Basic Salary (₹)</label>
                <input type="number" value={form.basic_salary} onChange={e=>setForm({...form,basic_salary:e.target.value})} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">HRA %</label>
                  <input type="number" value={form.hra_percent} onChange={e=>setForm({...form,hra_percent:e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"/></div>
                <div><label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">Special Allowance (₹)</label>
                  <input type="number" value={form.special_allowance} onChange={e=>setForm({...form,special_allowance:e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"/></div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={()=>setShowDialog(false)} className="px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving?'Saving...':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
