import React, { useState } from 'react';
import { Truck, Package, MapPin, CheckCircle, ChevronDown, Shield, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import ShipmentTimeline from '../ui/ShipmentTimeline';
import PuneMap from '../maps/PuneMap';
import { Parcel, ParcelStatus } from '../../types';

// Conductor can progress status up to 'arrived' — NOT 'delivered' (requires receiver OTP)
const STATUS_PROGRESSIONS: Partial<Record<ParcelStatus, { next: ParcelStatus; label: string; location: string; desc: string }>> = {
  assigned:   { next: 'picked_up',  label: 'Mark Picked Up',        location: 'Pickup Stop',        desc: 'Parcel picked up from sender' },
  picked_up:  { next: 'in_transit', label: 'Mark In Transit',        location: 'En Route',           desc: 'Bus en route to destination' },
  in_transit: { next: 'arrived',    label: 'Arrived at Destination', location: 'Destination Stop',   desc: 'Arrived at destination stop – awaiting receiver OTP' },
};

export default function ConductorDashboard() {
  const { currentUser, parcels, updateParcelStatus } = useApp();
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const myParcels = parcels.filter((p) => p.conductorId === currentUser?.id);
  const activeParcels = myParcels.filter((p) => !['delivered', 'cancelled'].includes(p.status));
  const completedParcels = myParcels.filter((p) => p.status === 'delivered');

  // Keep liveParcel in sync
  const liveParcel = selectedParcel ? parcels.find((p) => p.id === selectedParcel.id) || selectedParcel : null;

  const handleStatusUpdate = async (parcel: Parcel) => {
    const prog = STATUS_PROGRESSIONS[parcel.status];
    if (!prog) return;
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 600));
    updateParcelStatus(parcel.id, prog.next, prog.location, prog.desc);
    setUpdating(false);
    setUpdateMsg(`Status updated to: ${prog.label}`);
    setTimeout(() => setUpdateMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Truck className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Conductor Dashboard</h1>
          <p className="text-white/50 text-sm">PMPML Parcel – Manage your assigned shipments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Assigned', value: myParcels.length, color: '#3b82f6' },
          { label: 'Active', value: activeParcels.length, color: '#f59e0b' },
          { label: 'Delivered', value: completedParcels.length, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 text-center">
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-white/40 text-sm mt-1">{s.label}</div>
            <div className="w-full h-1 rounded-full mt-3 opacity-50" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Note about OTP */}
      <div className="glass-card p-4 flex items-start gap-3"
        style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
        <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-purple-300 text-sm">
          <strong>OTP Policy:</strong> You can update shipment status up to "Arrived at Destination".
          Final delivery requires the <strong>receiver</strong> to verify their OTP — conductors cannot bypass this step.
        </p>
      </div>

      {/* Map */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          {liveParcel ? `Route: ${liveParcel.pickupLocation} → ${liveParcel.destination}` : 'Pune PMPML Routes'}
        </h2>
        <PuneMap
          height="260px"
          selectedStopNames={liveParcel ? [liveParcel.pickupLocation, ...(liveParcel.intermediateStops || []), liveParcel.destination] : undefined}
        />
      </div>

      {/* Parcels list + detail */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-white">Assigned Shipments</h2>
          {myParcels.length === 0 ? (
            <div className="glass-card p-8 text-center text-white/30 text-sm">No shipments assigned yet</div>
          ) : (
            myParcels.map((p) => (
              <div key={p.id}
                className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:border-emerald-400/40 ${liveParcel?.id === p.id ? 'border-emerald-400/60 bg-emerald-500/10' : ''}`}
                onClick={() => { setSelectedParcel(p); setUpdateMsg(''); }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-blue-300 text-sm font-bold">{p.trackingNumber}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <p className="text-white/60 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{p.pickupLocation} → {p.destination}
                </p>
                <div className="flex justify-between mt-2 text-xs text-white/30">
                  <span>{p.receiverName}</span>
                  <span className="font-mono text-white/50">{p.assignedBus}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-3">
          {liveParcel ? (
            <div className="glass-card p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">{liveParcel.trackingNumber}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={liveParcel.status} />
                  <span className="text-white/40 text-xs">· {liveParcel.parcelType} · {liveParcel.weight}kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { l: 'From', v: liveParcel.pickupLocation },
                  { l: 'Via', v: liveParcel.intermediateStops?.length ? liveParcel.intermediateStops.join(', ') : 'Direct' },
                  { l: 'To', v: liveParcel.destination },
                  { l: 'Receiver', v: liveParcel.receiverName },
                  { l: 'Bus', v: liveParcel.assignedBus || '—' },
                  { l: 'Amount', v: `₹${liveParcel.amount}` },
                ].map((r) => (
                  <div key={r.l} className="p-3 rounded-xl bg-white/5">
                    <div className="text-white/40 text-xs">{r.l}</div>
                    <div className="text-white text-sm">{r.v}</div>
                  </div>
                ))}
              </div>

              {/* Update button */}
              {STATUS_PROGRESSIONS[liveParcel.status] && (
                <div>
                  {updateMsg ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-center font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> {updateMsg}
                    </div>
                  ) : (
                    <button className="btn-success w-full flex items-center justify-center gap-2"
                      disabled={updating}
                      onClick={() => handleStatusUpdate(liveParcel)}>
                      {updating ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><ChevronDown className="w-5 h-5" />{STATUS_PROGRESSIONS[liveParcel.status]?.label}</>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Arrived state — waiting for receiver OTP */}
              {liveParcel.status === 'arrived' && !liveParcel.isConfirmedByReceiver && (
                <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-500/10 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-semibold text-sm">Awaiting Receiver OTP</p>
                    <p className="text-white/40 text-xs mt-1">
                      The parcel has arrived. Final delivery requires the receiver to enter their OTP.
                      Inform the receiver to check the VAHAK app.
                    </p>
                  </div>
                </div>
              )}

              {/* Delivered */}
              {liveParcel.status === 'delivered' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                  <p className="font-semibold">Delivered & OTP Verified ✓</p>
                  {liveParcel.otpVerifiedAt && (
                    <p className="text-xs mt-1 text-emerald-400/70">
                      Verified at {new Date(liveParcel.otpVerifiedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Timeline</h4>
                <ShipmentTimeline timeline={liveParcel.timeline} currentStatus={liveParcel.status} />
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center h-full flex items-center justify-center text-white/30">
              <div>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a shipment to manage</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
