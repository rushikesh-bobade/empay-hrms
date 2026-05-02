import { cn } from '../../lib/utils';

const roleStyles = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  hr_officer: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  payroll_officer: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  employee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const roleLabels = {
  admin: 'Admin',
  hr_officer: 'HR Officer',
  payroll_officer: 'Payroll Officer',
  employee: 'Employee',
};

export default function RoleBadge({ role, className }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      roleStyles[role] || roleStyles.employee,
      className
    )}>
      {roleLabels[role] || role}
    </span>
  );
}
