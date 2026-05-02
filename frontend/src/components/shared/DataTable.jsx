import { useState } from 'react';
import { Search } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({ columns, data, searchKey, isLoading, searchPlaceholder = 'Search...' }) {
  const [search, setSearch] = useState('');

  const filtered = search && searchKey
    ? data.filter(row => {
        const keys = Array.isArray(searchKey) ? searchKey : [searchKey];
        return keys.some(k => String(row[k] || '').toLowerCase().includes(search.toLowerCase()));
      })
    : data;

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        {searchKey && (
          <div className="p-4 border-b border-slate-800">
            <div className="h-10 bg-slate-800 rounded-lg animate-pulse w-64" />
          </div>
        )}
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {searchKey && (
        <div className="p-4 border-b border-slate-800">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-slate-800/30 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 text-sm text-slate-300">
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
