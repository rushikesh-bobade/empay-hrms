import { cn } from '../../lib/utils';

const statusStyles = {
  present: 'bg-emerald-500/20 text-emerald-400',
  absent: 'bg-red-500/20 text-red-400',
  half_day: 'bg-amber-500/20 text-amber-400',
  on_leave: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
  draft: 'bg-slate-500/20 text-slate-400',
  finalized: 'bg-emerald-500/20 text-emerald-400',
  active: 'bg-emerald-500/20 text-emerald-400',
  inactive: 'bg-red-500/20 text-red-400',
};

const statusLabels = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half Day',
  on_leave: 'On Leave',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
  finalized: 'Finalized',
  active: 'Active',
  inactive: 'Inactive',
};

export default function StatusBadge({ status, className }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusStyles[status] || 'bg-slate-500/20 text-slate-400',
      className
    )}>
      {statusLabels[status] || status}
    </span>
  );
}
