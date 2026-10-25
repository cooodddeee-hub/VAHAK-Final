import React from 'react';
import { TimelineEvent, ParcelStatus } from '../../types';
import { CheckCircle, Circle, Clock, MapPin } from 'lucide-react';

interface Props {
  timeline: TimelineEvent[];
  currentStatus: ParcelStatus;
}

const ALL_STATUSES: ParcelStatus[] = [
  'booked', 'assigned', 'picked_up', 'in_transit', 'arrived', 'delivered',
];

const STATUS_LABELS: Record<ParcelStatus, string> = {
  booked:      'Booked',
  assigned:    'Bus Assigned',
  picked_up:   'Picked Up',
  in_transit:  'In Transit',
  arrived:     'Arrived at Destination',
  delivered:   'Delivered (OTP Verified)',
  cancelled:   'Cancelled',
};

export default function ShipmentTimeline({ timeline, currentStatus }: Props) {
  const completedStatuses = new Set(timeline.map((t) => t.status));
  const statuses = currentStatus === 'cancelled'
    ? [...ALL_STATUSES, 'cancelled' as ParcelStatus]
    : ALL_STATUSES;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-0">
      {statuses.map((status, idx) => {
        const event = timeline.find((t) => t.status === status);
        const isDone = completedStatuses.has(status);
        const isCurrent = status === currentStatus;
        const isLast = idx === statuses.length - 1;

        return (
          <div key={status} className="flex gap-4">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                isDone
                  ? status === 'delivered' ? 'bg-emerald-500 border-emerald-400' : 'bg-blue-500 border-blue-400'
                  : isCurrent
                  ? 'bg-blue-500/50 border-blue-400 shadow-lg shadow-blue-500/40'
                  : 'bg-white/5 border-white/20'
              }`}>
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-white/30" />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-[2rem] rounded-full transition-all duration-300 ${isDone ? 'bg-blue-500/50' : 'bg-white/10'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm ${isDone || isCurrent ? 'text-white' : 'text-white/30'}`}>
                  {STATUS_LABELS[status]}
                </span>
                {event && (
                  <span className="text-white/30 text-xs">{formatTime(event.timestamp)}</span>
                )}
              </div>
              {event ? (
                <>
                  <p className="text-white/50 text-xs mt-0.5">{event.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-white/30 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                </>
              ) : (
                <p className="text-white/25 text-xs mt-0.5">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
