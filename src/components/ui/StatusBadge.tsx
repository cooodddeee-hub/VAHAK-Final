import React from 'react';
import { ParcelStatus } from '../../types';

interface Props {
  status: ParcelStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<ParcelStatus, { label: string; color: string; bg: string; dot: string }> = {
  booked:      { label: 'Booked',           color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  dot: '#60a5fa' },
  assigned:    { label: 'Bus Assigned',     color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', dot: '#a78bfa' },
  picked_up:   { label: 'Picked Up',        color: '#34d399', bg: 'rgba(16,185,129,0.15)', dot: '#34d399' },
  in_transit:  { label: 'In Transit',       color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', dot: '#fbbf24' },
  arrived:     { label: 'Arrived',          color: '#fb923c', bg: 'rgba(249,115,22,0.15)', dot: '#fb923c' },
  delivered:   { label: 'Delivered ✓',     color: '#4ade80', bg: 'rgba(34,197,94,0.15)',  dot: '#4ade80' },
  cancelled:   { label: 'Cancelled',        color: '#f87171', bg: 'rgba(239,68,68,0.15)',  dot: '#f87171' },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.booked;
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-xs ${padding}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
