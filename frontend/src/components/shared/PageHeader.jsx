export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h2 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em]" style={{ color: 'var(--t-on-surface)', fontFamily: 'Inter' }}>{title}</h2>
        {subtitle && <p className="text-base mt-1" style={{ color: 'var(--t-on-surface-variant)' }}>{subtitle}</p>}
      </div>
      {action || children}
    </div>
  );
}
