import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PMPML_STOPS, PUNE_ROUTES, STOP_BY_NAME } from '../../data/sampleData';
import { PmpmlStop } from '../../types';

// Fix Leaflet icon paths for Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createDotIcon = (color: string, size = 14, label = '') =>
  L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:3px solid rgba(255,255,255,0.95);
      border-radius:50%;
      box-shadow:0 0 10px ${color}90,0 2px 6px rgba(0,0,0,0.5);
      position:relative;
    ">${label ? `<span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;font-weight:700;color:#fff;background:${color};padding:1px 4px;border-radius:3px;">${label}</span>` : ''}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

// Recenter / fitBounds when selectedStops change
function MapFitter({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
    }
  }, [positions, map]);
  return null;
}

interface Props {
  height?: string;
  /** When provided, draw only these stops (by name) in order */
  selectedStopNames?: string[];
  /** When true, show all demo routes instead of selected stops */
  showAllRoutes?: boolean;
}

const STOP_TYPE_COLOR: Record<PmpmlStop['type'], string> = {
  major: '#3b82f6',
  minor: '#8b5cf6',
  depot: '#10b981',
};

export default function PuneMap({ height = '400px', selectedStopNames, showAllRoutes }: Props) {
  // Build positions list from selected stop names
  const resolvedStops: Array<{ name: string; coords: [number, number]; role: 'origin' | 'intermediate' | 'destination' }> =
    (selectedStopNames || [])
      .map((name, idx) => {
        const stop = STOP_BY_NAME[name] || PMPML_STOPS.find((s) => s.name === name);
        if (!stop) return null;
        const role = idx === 0 ? 'origin' : idx === (selectedStopNames!.length - 1) ? 'destination' : 'intermediate';
        return { name: stop.name, coords: stop.coords, role } as const;
      })
      .filter(Boolean) as Array<{ name: string; coords: [number, number]; role: 'origin' | 'intermediate' | 'destination' }>;

  const polylinePositions = resolvedStops.map((s) => s.coords);

  const markerColors = { origin: '#10b981', intermediate: '#f59e0b', destination: '#ef4444' };

  // default center: Pune
  const defaultCenter: [number, number] = [18.5204, 73.8567];

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-white/20">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fitter: adjusts viewport when stops change */}
        {polylinePositions.length > 0 && <MapFitter positions={polylinePositions} />}

        {/* All demo routes (background) */}
        {(showAllRoutes || !selectedStopNames || selectedStopNames.length === 0) &&
          PUNE_ROUTES.map((route) => (
            <Polyline key={route.id} positions={route.waypoints}
              pathOptions={{ color: route.color, weight: 3, opacity: 0.6, dashArray: '6,4' }}>
              <Popup>
                <div className="text-white">
                  <strong style={{ fontSize: '12px' }}>{route.name}</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Illustrative demo route</span>
                </div>
              </Popup>
            </Polyline>
          ))
        }

        {/* Selected stop route polyline */}
        {polylinePositions.length >= 2 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.9 }}>
            <Popup>
              <div className="text-white" style={{ fontSize: '12px' }}>
                <strong>Selected Route</strong>
                <br />
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {resolvedStops[0].name} → {resolvedStops[resolvedStops.length - 1].name}
                </span>
                <br />
                <span style={{ fontSize: '10px', color: 'rgba(255,165,0,0.8)' }}>
                  ⚠️ Straight-line visualization only (no road routing)
                </span>
              </div>
            </Popup>
          </Polyline>
        )}

        {/* Selected stop markers */}
        {resolvedStops.map((s, idx) => (
          <Marker
            key={`sel-${idx}`}
            position={s.coords}
            icon={createDotIcon(
              markerColors[s.role],
              s.role === 'origin' || s.role === 'destination' ? 18 : 14,
              s.role === 'origin' ? 'FROM' : s.role === 'destination' ? 'TO' : String(idx)
            )}>
            <Popup>
              <div className="text-white">
                <strong>{s.name}</strong>
                <br />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
                  {s.role === 'origin' ? '🟢 Origin' : s.role === 'destination' ? '🔴 Destination' : '🟡 Intermediate stop'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* All PMPML stops (background dots) when no selection */}
        {(!selectedStopNames || selectedStopNames.length === 0) &&
          PMPML_STOPS.map((stop) => (
            <Marker
              key={stop.id}
              position={stop.coords}
              icon={createDotIcon(STOP_TYPE_COLOR[stop.type], stop.type === 'major' ? 14 : 10)}>
              <Popup>
                <div className="text-white">
                  <strong>{stop.name}</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
                    {stop.type} PMPML stop · Demo data
                  </span>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>

      {/* Legend */}
      {resolvedStops.length > 0 ? (
        <div className="flex flex-wrap gap-3 mt-3 px-1">
          {[
            { label: 'Origin', color: '#10b981' },
            { label: 'Intermediate', color: '#f59e0b' },
            { label: 'Destination', color: '#ef4444' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-white/50 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
          <span className="text-white/25 text-xs ml-auto">⚠️ Straight-line only – not road routing</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 mt-3 px-1">
          {[
            { label: 'Major stop', color: '#3b82f6' },
            { label: 'Minor stop', color: '#8b5cf6' },
            { label: 'Depot', color: '#10b981' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-white/50 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
          <span className="text-white/25 text-xs ml-auto">Illustrative PMPML demo data</span>
        </div>
      )}
    </div>
  );
}
