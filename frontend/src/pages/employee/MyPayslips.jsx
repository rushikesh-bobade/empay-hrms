import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { Download, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MyPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewSlip, setViewSlip] = useState(null);
  const [slipDetail, setSlipDetail] = useState(null);

  useEffect(() => {
    api.get('/payroll/payslips/my').then(res => { setPayslips(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const viewDetail = async (ps) => {
    try {
      const res = await api.get(`/payroll/payslips/${ps.id}`);
      setSlipDetail(res.data.data);
      setViewSlip(ps);
    } catch { toast.error('Failed to fetch details'); }
  };

  const downloadPDF = async (id) => {
    try {
      const res = await api.get(`/payroll/payslips/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { toast.error('Failed to download'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Payslips" subtitle="View and download your salary slips." />
      <div className="glass-card overflow-hidden fade-in">
        <table className="w-full glass-table">
          <thead><tr><th>Month</th><th>Year</th><th>Gross Salary</th><th>Deductions</th><th>Net Pay</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({length:3}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j)=><td key={j}><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>) :
            payslips.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant">No payslips yet</td></tr> :
            payslips.map(ps => (
              <tr key={ps.id}>
                <td className="font-medium text-on-surface">{months[ps.month - 1]}</td>
                <td>{ps.year}</td>
                <td>₹{parseFloat(ps.gross_salary).toLocaleString()}</td>
                <td className="text-danger">₹{parseFloat(ps.total_deductions).toLocaleString()}</td>
                <td className="text-primary font-semibold">₹{parseFloat(ps.net_pay).toLocaleString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => viewDetail(ps)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10"><Eye className="w-3.5 h-3.5" /> View</button>
                    <button onClick={() => downloadPDF(ps.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-tertiary hover:bg-tertiary/10"><Download className="w-3.5 h-3.5" /> PDF</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewSlip && slipDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewSlip(null)}>
          <div className="glass-card-strong w-full max-w-2xl p-6 fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Salary Slip</h2>
                <p className="text-sm text-on-surface-variant">For the month of {months[slipDetail.month - 1]} {slipDetail.year}</p>
              </div>
              <button onClick={() => setViewSlip(null)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">⊕ Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-on-surface-variant">Basic Salary</span><span className="text-on-surface">₹{parseFloat(slipDetail.basic).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">HRA</span><span className="text-on-surface">₹{parseFloat(slipDetail.hra).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Special Allowance</span><span className="text-on-surface">₹{parseFloat(slipDetail.special_allowance).toLocaleString()}</span></div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-semibold"><span className="text-on-surface">Gross Earnings</span><span className="text-primary">₹{parseFloat(slipDetail.gross_salary).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">⊖ Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-on-surface-variant">PF Employee (12%)</span><span className="text-on-surface">₹{parseFloat(slipDetail.pf_employee).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Professional Tax</span><span className="text-on-surface">₹{parseFloat(slipDetail.professional_tax).toLocaleString()}</span></div>
                  {parseFloat(slipDetail.unpaid_deduction) > 0 && (
                    <div className="flex justify-between"><span className="text-on-surface-variant">Loss of Pay (Unpaid Leave)</span><span className="text-on-surface">₹{parseFloat(slipDetail.unpaid_deduction).toLocaleString()}</span></div>
                  )}
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-semibold"><span className="text-on-surface">Total Deductions</span><span className="text-danger">₹{parseFloat(slipDetail.total_deductions).toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(77,142,255,0.15), rgba(87,27,193,0.15))', border: '1px solid rgba(77,142,255,0.2)' }}>
              <p className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant mb-1">Net Payable Salary</p>
              <p className="text-3xl font-bold text-primary">₹{parseFloat(slipDetail.net_pay).toLocaleString()}</p>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-on-surface-variant">Working Days: {slipDetail.working_days} · Present: {slipDetail.present_days} · Paid Leave: {slipDetail.leaves_approved} · Unpaid Leave: {slipDetail.unpaid_leave_days || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
