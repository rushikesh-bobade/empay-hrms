import { TrendingUp, TrendingDown } from 'lucide-react';

const glowColors = {
  primary: 'rgba(77, 142, 255, 0.2)',
  success: 'rgba(74, 222, 128, 0.2)',
  warning: 'rgba(251, 191, 36, 0.2)',
  danger: 'rgba(248, 113, 113, 0.2)',
  purple: 'rgba(167, 139, 250, 0.2)',
  cyan: 'rgba(76, 215, 246, 0.2)',
};

const iconColors = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a78bfa',
  cyan: '#06b6d4',
};

const chipColors = {
  primary: { bg: 'rgba(76, 215, 246, 0.1)', text: '#06b6d4', border: 'rgba(76, 215, 246, 0.2)' },
  success: { bg: 'rgba(74, 222, 128, 0.1)', text: '#22c55e', border: 'rgba(74, 222, 128, 0.2)' },
  warning: { bg: 'rgba(251, 191, 36, 0.1)', text: '#f59e0b', border: 'rgba(251, 191, 36, 0.2)' },
  danger: { bg: 'rgba(248, 113, 113, 0.1)', text: '#ef4444', border: 'rgba(248, 113, 113, 0.2)' },
  purple: { bg: 'rgba(167, 139, 250, 0.1)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.2)' },
  cyan: { bg: 'rgba(76, 215, 246, 0.1)', text: '#06b6d4', border: 'rgba(76, 215, 246, 0.2)' },
};

export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle, trend }) {
  const glow = glowColors[color] || glowColors.primary;
  const iconColor = iconColors[color] || iconColors.primary;
  const chip = chipColors[color] || chipColors.primary;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 fade-in">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 blur-2xl rounded-full group-hover:scale-110 transition-transform duration-500"
        style={{ background: glow }} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--t-icon-box-bg)', backdropFilter: 'blur(8px)', border: '1px solid var(--t-glass-border)' }}>
          {Icon && <Icon className="w-5 h-5" style={{ color: iconColor }} />}
        </div>
        {trend && (
          <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
            style={{ background: chip.bg, color: chip.text, border: `1px solid ${chip.border}` }}>
            {trend.startsWith('+') ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
        {subtitle && !trend && (
          <span className="text-xs font-semibold" style={{ color: 'var(--t-on-surface-variant)' }}>{subtitle}</span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[0.7rem] uppercase tracking-[0.05em] font-semibold mb-1" style={{ color: 'var(--t-on-surface-variant)' }}>{title}</p>
        <h3 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--t-on-surface)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
      </div>
    </div>
  );
}
