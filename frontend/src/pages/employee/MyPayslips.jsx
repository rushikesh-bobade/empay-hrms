import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import { Download, Eye, X } from 'lucide-react';

const monthNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MyPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewPayslip, setViewPayslip] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.get('/payroll/payslips/my').then(r=>setPayslips(r.data.data)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const handleView = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/payroll/payslips/${id}`);
      setViewPayslip(res.data.data);
    } catch(e){console.error(e);}
    finally{setDetailLoading(false);}
  };

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/payroll/payslips/${id}/pdf`, {responseType:'blob'});
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `payslip.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch(e){alert('Failed to download');}
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="My Payslips" subtitle="View and download your payslips"/>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Period</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Gross</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Deductions</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Net Pay</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan={5}><div className="h-12 bg-slate-800/50 rounded animate-pulse m-2"/></td></tr>) :
              payslips.map(ps=>(
                <tr key={ps.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-sm text-white font-medium">{monthNames[ps.month]} {ps.year}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">₹{parseFloat(ps.gross_salary).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-red-400">₹{parseFloat(ps.total_deductions).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 font-medium">₹{parseFloat(ps.net_pay).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>handleView(ps.id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Eye className="w-4 h-4"/></button>
                      <button onClick={()=>handleDownload(ps.id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Download className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {viewPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Payslip — {monthNames[viewPayslip.month]} {viewPayslip.year}</h2>
              <button onClick={()=>setViewPayslip(null)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-slate-500">Working Days</span><p className="text-white font-medium">{viewPayslip.working_days}</p></div>
                <div><span className="text-slate-500">Present Days</span><p className="text-white font-medium">{viewPayslip.present_days}</p></div>
                <div><span className="text-slate-500">Leave Days</span><p className="text-white font-medium">{viewPayslip.leaves_approved}</p></div>
              </div>
              <hr className="border-slate-800"/>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-indigo-400 mb-3">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Basic</span><span className="text-white">₹{parseFloat(viewPayslip.basic).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">HRA</span><span className="text-white">₹{parseFloat(viewPayslip.hra).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Special Allow.</span><span className="text-white">₹{parseFloat(viewPayslip.special_allowance).toLocaleString('en-IN')}</span></div>
                    <hr className="border-slate-800"/>
                    <div className="flex justify-between font-bold"><span className="text-white">Gross</span><span className="text-white">₹{parseFloat(viewPayslip.gross_salary).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-red-400 mb-3">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">PF (12%)</span><span className="text-white">₹{parseFloat(viewPayslip.pf_employee).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Prof. Tax</span><span className="text-white">₹{parseFloat(viewPayslip.professional_tax).toLocaleString('en-IN')}</span></div>
                    <hr className="border-slate-800"/>
                    <div className="flex justify-between font-bold"><span className="text-white">Total</span><span className="text-red-400">₹{parseFloat(viewPayslip.total_deductions).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <p className="text-xs text-indigo-400 uppercase tracking-wide">Net Pay</p>
                <p className="text-2xl font-bold text-white mt-1">₹{parseFloat(viewPayslip.net_pay).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
