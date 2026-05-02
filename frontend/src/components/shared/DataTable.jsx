export default function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'var(--t-panel-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--t-table-border)' }}>
              {columns.map((col) => (
                <th key={col.key} className="p-4 px-6 text-[0.7rem] uppercase tracking-[0.05em] font-semibold" style={{ color: 'var(--t-on-surface-variant)' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm" style={{ color: 'var(--t-on-surface)' }}>
            {data.map((row, idx) => (
              <tr key={idx}
                className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{ borderBottom: '1px solid var(--t-table-border-cell)' }}
                onClick={() => onRowClick?.(row)}>
                {columns.map((col) => (
                  <td key={col.key} className="p-4 px-6">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm" style={{ color: 'var(--t-outline)' }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
