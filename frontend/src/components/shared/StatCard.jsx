import { cn } from '../../lib/utils';

const colorMap = {
  blue: 'stat-card-blue',
  green: 'stat-card-green',
  amber: 'stat-card-amber',
  red: 'stat-card-red',
  purple: 'stat-card-purple',
  cyan: 'stat-card-cyan',
};

const iconColorMap = {
  blue: 'text-indigo-400',
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  purple: 'text-violet-400',
  cyan: 'text-cyan-400',
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  return (
    <div className={cn('rounded-xl p-5 animate-fadeIn', colorMap[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg bg-black/20', iconColorMap[color])}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
