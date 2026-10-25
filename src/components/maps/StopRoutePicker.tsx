import React from 'react';
import { Plus, X, ArrowDown, ArrowUp, MapPin } from 'lucide-react';
import { PMPML_STOP_NAMES } from '../../data/sampleData';

interface Props {
  stops: string[];           // ordered list [origin, ...intermediates, destination]
  onChange: (stops: string[]) => void;
  minStops?: number;         // default 2
  maxStops?: number;         // default 8
}

export default function StopRoutePicker({ stops, onChange, minStops = 2, maxStops = 8 }: Props) {
  const setStop = (idx: number, value: string) => {
    const next = [...stops];
    next[idx] = value;
    onChange(next);
  };

  const addIntermediate = () => {
    if (stops.length >= maxStops) return;
    // Insert before the last stop (destination)
    const next = [...stops];
    next.splice(stops.length - 1, 0, '');
    onChange(next);
  };

  const removeStop = (idx: number) => {
    if (stops.length <= minStops) return;
    onChange(stops.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx <= 1) return; // origin stays fixed
    const next = [...stops];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx >= stops.length - 2) return; // destination stays fixed
    const next = [...stops];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const LABEL_COLOR = ['#10b981', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#ef4444'];
  const STOP_ROLES = (idx: number) =>
    idx === 0 ? 'Origin' : idx === stops.length - 1 ? 'Destination' : `Stop ${idx}`;

  return (
    <div className="space-y-2">
      {stops.map((stop, idx) => {
        const isOrigin = idx === 0;
        const isDest = idx === stops.length - 1;
        const isIntermediate = !isOrigin && !isDest;
        const dotColor = isOrigin ? '#10b981' : isDest ? '#ef4444' : '#f59e0b';

        return (
          <div key={idx} className="flex items-center gap-2">
            {/* Dot + line */}
            <div className="flex flex-col items-center flex-shrink-0 w-5">
              <div
                className="w-3 h-3 rounded-full border-2 border-white/80 flex-shrink-0"
                style={{ background: dotColor }} />
              {!isDest && (
                <div className="w-0.5 h-4 bg-white/15 rounded-full mt-0.5" />
              )}
            </div>

            {/* Select */}
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-semibold" style={{ color: dotColor }}>
                  {STOP_ROLES(idx)}
                </span>
              </div>
              <select
                className="input-field py-2 text-sm"
                value={stop}
                onChange={(e) => setStop(idx, e.target.value)}>
                <option value="" className="bg-[#0d1b60]">
                  {isOrigin ? 'Select pickup stop…' : isDest ? 'Select destination stop…' : 'Select intermediate stop…'}
                </option>
                {PMPML_STOP_NAMES.map((name) => (
                  <option key={name} value={name} className="bg-[#0d1b60]">{name}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              {isIntermediate && (
                <>
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    title="Move up">
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    title="Move down">
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </>
              )}
              {isIntermediate && (
                <button
                  type="button"
                  onClick={() => removeStop(idx)}
                  className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                  title="Remove stop">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add stop button */}
      {stops.length < maxStops && (
        <button
          type="button"
          onClick={addIntermediate}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors mt-1 ml-7">
          <Plus className="w-4 h-4" />
          Add intermediate stop
        </button>
      )}

      {/* Route summary */}
      {stops.filter(Boolean).length >= 2 && (
        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
            <MapPin className="w-3 h-3" />
            <span>Route summary</span>
          </div>
          <p className="text-white/70 text-sm">
            {stops.filter(Boolean).join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}
