import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant">
      <Icon className="w-12 h-12 mb-4 opacity-30" />
      {title && <h3 className="text-base font-semibold mb-1">{title}</h3>}
      {message && <p className="text-sm opacity-70">{message}</p>}
    </div>
  );
}