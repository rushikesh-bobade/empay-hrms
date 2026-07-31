import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { CalendarCheck, CalendarX } from 'lucide-react';
import { toast } from 'sonner';

// ── date-fns localizer ─────────────────────────────────────────
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ── Leave type → color mapping ─────────────────────────────────
const LEAVE_TYPE_COLORS = {
  'Sick Leave':     '#ef4444',  // red
  'Vacation':       '#3b82f6',  // blue
  'Annual':         '#3b82f6',  // blue (alias)
  'Casual Leave':   '#f59e0b',  // amber
  'Personal Leave': '#f59e0b',  // amber (alias)
  'Maternity':      '#a855f7',  // purple
  'Paternity':      '#06b6d4',  // cyan
  'Bereavement':    '#64748b',  // slate
  'Comp-off':       '#10b981',  // emerald
  'Marriage':       '#ec4899',  // pink
};

const PALETTE = [
  '#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4',
  '#64748b', '#10b981', '#ec4899', '#f97316', '#14b8a6',
];

function getLeaveTypeColor(leaveTypeName, typeIndex) {
  return LEAVE_TYPE_COLORS[leaveTypeName] || PALETTE[(typeIndex || 0) % PALETTE.length];
}

// ── Leave request → calendar event ─────────────────────────────
function mapLeaveToEvent(leaveRequest) {
  const start = new Date(leaveRequest.start_date);
  const end = new Date(leaveRequest.end_date);
  // react-big-calendar uses exclusive end dates; add 1 day so
  // end_date is visually included
  end.setDate(end.getDate() + 1);

  return {
    id: leaveRequest.id,
    title: `${leaveRequest.full_name} — ${leaveRequest.leave_type_name}`,
    start,
    end,
    allDay: true,
    leaveType: leaveRequest.leave_type_name,
    leaveTypeId: leaveRequest.leave_type_id,
    employeeName: leaveRequest.full_name,
    totalDays: leaveRequest.total_days,
    department: leaveRequest.department,
    resource: leaveRequest,
  };
}

// ── Component ──────────────────────────────────────────────────
export default function HRLeaveCalendar() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leave/requests/all?status=approved');
      setLeaves(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load calendar data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform leave requests into calendar events
  const events = useMemo(() => leaves.map(mapLeaveToEvent), [leaves]);

  // Per-event styling for colour-coded bars
  const eventPropGetter = useCallback((event) => ({
    style: {
      backgroundColor: getLeaveTypeColor(event.leaveType, event.leaveTypeId),
      borderRadius: '6px',
      opacity: 0.9,
      color: '#fff',
      border: 'none',
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: 500,
      padding: '2px 4px',
    },
  }), []);

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leave Calendar" subtitle="Visual overview of approved leaves." />
        <div className="skeleton h-[600px] rounded-2xl" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leave Calendar" subtitle="Visual overview of approved leaves." />
        <div className="glass-card p-8 text-center fade-in">
          <CalendarX className="w-12 h-12 mx-auto mb-4 text-on-surface-variant opacity-30" />
          <h3 className="text-base font-semibold text-on-surface mb-2">Failed to load calendar</h3>
          <p className="text-sm text-on-surface-variant mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="btn-glow px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#4d8eff,#571bc1)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Calendar"
        subtitle="Visual overview of approved leaves."
      />

      <div className="relative glass-card p-4 fade-in" style={{ minHeight: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          views={[Views.MONTH]}
          eventPropGetter={eventPropGetter}
          popup
          style={{ height: 600 }}
        />

        {/* Empty-state overlay when no approved leaves exist */}
        {events.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-[var(--glass-bg)] backdrop-blur-sm rounded-xl px-8 py-6 text-center">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 text-on-surface-variant opacity-40" />
              <p className="text-sm font-medium text-on-surface-variant">
                No approved leaves in this period
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
