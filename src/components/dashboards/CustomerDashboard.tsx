import React, { useState } from 'react';
import { Package, MapPin, Printer, TrendingUp, Clock, CheckCircle, Truck, Shield, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import ShipmentTimeline from '../ui/ShipmentTimeline';
import DeliveryReceipt from '../ui/DeliveryReceipt';
import PuneMap from '../maps/PuneMap';
import { Parcel } from '../../types';

export default function CustomerDashboard() {
  const { currentUser, parcels, setActiveTab } = useApp();
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const myParcels = parcels.filter((p) => p.senderId === currentUser?.id);

  const stats = [
    { label: 'Total Bookings', value: myParcels.length, color: '#3b82f6' },
    { label: 'In Progress', value: myParcels.filter((p) => ['assigned','picked_up','in_transit','arrived'].includes(p.status)).length, color: '#f59e0b' },
    { label: 'Delivered', value: myParcels.filter((p) => p.status === 'delivered').length, color: '#10b981' },
    { label: 'Pending', value: myParcels.filter((p) => p.status === 'booked').length, color: '#8b5cf6' },
  ];

  // Keep selected parcel in sync with live state
  const liveSelected = selectedParcel ? parcels.find((p) => p.id === selectedParcel.id) || selectedParcel : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const copyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp).catch(() => {});
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  // Parcels awaiting OTP verification — remind sender to share OTP
  const awaitingOtp = myParcels.filter(
    (p) => p.status === 'arrived' && !p.isConfirmedByReceiver
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, {currentUser?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-white/50 mt-1 text-sm">PMPML Parcel Service · Pune City Demo</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setActiveTab('book')}>
          <Package className="w-5 h-5" /> Book Parcel
        </button>
      </div>

      {/* OTP reminder banner */}
      {awaitingOtp.length > 0 && (
        <div className="glass-card p-4 flex items-start gap-3"
          style={{ borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.07)' }}>
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 text-sm font-semibold mb-1">
              {awaitingOtp.length} parcel{awaitingOtp.length > 1 ? 's' : ''} arrived — share the OTP with your receiver!
            </p>
            <div className="space-y-2 mt-2">
              {awaitingOtp.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-white/60 text-xs font-mono">{p.trackingNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 text-sm font-bold tracking-widest">{p.deliveryOtp}</span>
                    <button onClick={() => copyOtp(p.deliveryOtp)}
                      className="text-white/40 hover:text-amber-300 transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                    {copiedOtp === p.deliveryOtp && <span className="text-emerald-400 text-xs">Copied!</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
                <TrendingUp className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-white/40 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          {liveSelected ? `Route: ${liveSelected.pickupLocation} → ${liveSelected.destination}` : 'Pune PMPML Routes'}
        </h2>
        <PuneMap
          height="300px"
          selectedStopNames={liveSelected
            ? [liveSelected.pickupLocation, ...(liveSelected.intermediateStops || []), liveSelected.destination]
            : undefined
          }
        />
      </div>

      {/* Bookings list + detail */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-white">Your Shipments</h2>
          {myParcels.length === 0 ? (
            <div className="glass-card p-8 text-center text-white/40">
              No bookings yet.{' '}
              <button className="text-blue-400 hover:text-blue-300 underline" onClick={() => setActiveTab('book')}>
                Book your first parcel
              </button>
            </div>
          ) : (
            myParcels.map((p) => (
              <div key={p.id}
                className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:border-blue-400/40 ${liveSelected?.id === p.id ? 'border-blue-400/60 bg-blue-500/10' : ''}`}
                onClick={() => setSelectedParcel(p)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-blue-300 text-sm font-bold">{p.trackingNumber}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <div className="text-white/70 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {p.pickupLocation} → {p.destination}
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/30">
                  <span>{formatDate(p.createdAt)}</span>
                  <span className="text-emerald-400 font-semibold">₹{p.amount}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {liveSelected ? (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{liveSelected.trackingNumber}</h3>
                  <p className="text-white/40 text-sm capitalize">{liveSelected.parcelType} · {liveSelected.weight} kg</p>
                </div>
                <button className="btn-secondary py-2 px-4 flex items-center gap-1.5 text-sm"
                  onClick={() => setShowReceipt(true)}>
                  <Printer className="w-4 h-4" /> Receipt
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { l: 'From', v: liveSelected.pickupLocation },
                  { l: 'To', v: liveSelected.destination },
                  { l: 'Via', v: liveSelected.intermediateStops?.length ? liveSelected.intermediateStops.join(', ') : 'Direct' },
                  { l: 'Receiver', v: liveSelected.receiverName },
                  { l: 'Bus', v: liveSelected.assignedBus || 'Not yet assigned' },
                  { l: 'Amount', v: `₹${liveSelected.amount}` },
                ].map((r) => (
                  <div key={r.l} className="p-3 rounded-xl bg-white/5">
                    <div className="text-white/40 text-xs">{r.l}</div>
                    <div className="text-white text-sm">{r.v}</div>
                  </div>
                ))}
              </div>

              {/* OTP reminder for arrived parcels */}
              {liveSelected.status === 'arrived' && !liveSelected.isConfirmedByReceiver && (
                <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-semibold text-sm">Share OTP with Receiver</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-300 text-2xl font-black tracking-widest">
                      {liveSelected.deliveryOtp}
                    </span>
                    <button onClick={() => copyOtp(liveSelected.deliveryOtp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs transition-all">
                      <Copy className="w-3 h-3" />
                      {copiedOtp === liveSelected.deliveryOtp ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-white/30 text-xs mt-2">
                    The receiver must enter this in their dashboard. Demo only — no SMS is sent.
                  </p>
                </div>
              )}

              {liveSelected.isConfirmedByReceiver && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center gap-3 text-emerald-300">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Delivered & OTP Verified ✓</p>
                    {liveSelected.otpVerifiedAt && (
                      <p className="text-xs text-emerald-400/70 mt-0.5">
                        {new Date(liveSelected.otpVerifiedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Shipment Timeline</h4>
                <ShipmentTimeline timeline={liveSelected.timeline} currentStatus={liveSelected.status} />
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center h-full flex items-center justify-center text-white/30">
              <div>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a shipment to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReceipt && liveSelected && (
        <DeliveryReceipt parcel={liveSelected} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
