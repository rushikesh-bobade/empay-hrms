import { FileX } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There are no records to display.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-full bg-slate-800/50 mb-4">
        <FileX className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-300">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}
