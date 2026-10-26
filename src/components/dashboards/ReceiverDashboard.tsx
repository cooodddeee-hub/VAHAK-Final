import React, { useState, useRef } from 'react';
import {
  Package, CheckCircle, Printer, MapPin, Phone, Clock,
  Shield, AlertCircle, Lock, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import ShipmentTimeline from '../ui/ShipmentTimeline';
import DeliveryReceipt from '../ui/DeliveryReceipt';
import PuneMap from '../maps/PuneMap';
import { Parcel } from '../../types';

const MAX_OTP_ATTEMPTS = 5;

export default function ReceiverDashboard() {
  const { currentUser, parcels, verifyOtpAndDeliver } = useApp();
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // OTP entry state
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  // Parcels for this receiver (by email or receiverId)
  const myParcels = parcels.filter(
    (p) =>
      p.receiverId === currentUser?.id ||
      p.receiverEmail?.trim()?.toLowerCase() === currentUser?.email?.trim()?.toLowerCase()
  );

  const pendingOtp = myParcels.filter(
    (p) => p.status === 'arrived' && !p.isConfirmedByReceiver
  );
  const confirmed = myParcels.filter((p) => p.isConfirmedByReceiver);

  const handleSelectParcel = (p: Parcel) => {
    setSelectedParcel(p);
    setOtpValue('');
    setOtpError('');
    setOtpSuccess(false);
    setVerifying(false);
  };

  const handleVerifyOtp = async () => {
    if (!selectedParcel || otpValue.length !== 6) {
      setOtpError('Please enter a 6-digit OTP.');
      return;
    }
    setVerifying(true);
    setOtpError('');

    // Simulate a brief processing delay
    await new Promise((r) => setTimeout(r, 700));

    const result = verifyOtpAndDeliver(selectedParcel.id, otpValue);

    setVerifying(false);

    if (result.success) {
      setOtpSuccess(true);
      setOtpValue('');
      // Refresh selectedParcel from the updated parcels list
      // (will happen on next render via parcels prop)
    } else {
      setOtpError(result.message);
      if (result.locked) setOtpValue('');
    }
  };

  // Keep selectedParcel in sync with live parcels state
  const liveSelectedParcel = selectedParcel
    ? parcels.find((p) => p.id === selectedParcel.id) || selectedParcel
    : null;

  const isLocked = liveSelectedParcel ? liveSelectedParcel.otpAttempts >= MAX_OTP_ATTEMPTS : false;
  const canEnterOtp =
    liveSelectedParcel &&
    !liveSelectedParcel.isConfirmedByReceiver &&
    (liveSelectedParcel.status === 'arrived') &&
    !isLocked;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <Package className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Receiver Dashboard</h1>
          <p className="text-white/50 text-sm">Track incoming parcels and confirm delivery via OTP</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Expected', value: myParcels.length, color: '#3b82f6' },
          { label: 'Awaiting OTP', value: pendingOtp.length, color: '#f59e0b' },
          { label: 'Confirmed', value: confirmed.length, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 text-center">
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-white/40 text-sm mt-1">{s.label}</div>
            <div className="w-full h-1 rounded-full mt-3 opacity-50" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Pending OTP banner */}
      {pendingOtp.length > 0 && (
        <div className="glass-card p-4 flex items-center gap-3"
          style={{ borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)' }}>
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong>{pendingOtp.length}</strong> parcel{pendingOtp.length !== 1 ? 's' : ''} arrived and waiting for OTP verification.
            Ask your sender for the 6-digit code.
          </p>
        </div>
      )}

      {/* List + Detail */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-white">Incoming Parcels</h2>
          {myParcels.length === 0 ? (
            <div className="glass-card p-8 text-center text-white/30 text-sm">
              No parcels addressed to you yet.
              <br />
              <span className="text-xs mt-2 block text-white/20">
                Parcels sent to {currentUser?.email} will appear here.
              </span>
            </div>
          ) : (
            myParcels.map((p) => {
              const needsOtp = p.status === 'arrived' && !p.isConfirmedByReceiver;
              return (
                <div
                  key={p.id}
                  className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:border-amber-400/40 ${liveSelectedParcel?.id === p.id ? 'border-amber-400/60 bg-amber-500/10' : ''}`}
                  onClick={() => handleSelectParcel(p)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-blue-300 text-sm font-bold">{p.trackingNumber}</span>
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                  <p className="text-white/60 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{p.pickupLocation} → {p.destination}
                  </p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-white/40">From: {p.senderName}</span>
                    {needsOtp && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> OTP needed
                      </span>
                    )}
                    {p.isConfirmedByReceiver && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {liveSelectedParcel ? (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{liveSelectedParcel.trackingNumber}</h3>
                  <p className="text-white/40 text-sm capitalize">
                    {liveSelectedParcel.parcelType} · {liveSelectedParcel.weight} kg
                  </p>
                </div>
                <div className="flex gap-2">
                  {liveSelectedParcel.isConfirmedByReceiver && (
                    <button
                      className="btn-secondary py-2 px-4 flex items-center gap-1.5 text-sm"
                      onClick={() => setShowReceipt(true)}>
                      <Printer className="w-4 h-4" /> Receipt
                    </button>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { l: 'Sender', v: liveSelectedParcel.senderName },
                  { l: 'From', v: liveSelectedParcel.pickupLocation },
                  { l: 'To', v: liveSelectedParcel.destination },
                  { l: 'Via', v: liveSelectedParcel.intermediateStops?.length ? liveSelectedParcel.intermediateStops.join(', ') : 'Direct' },
                  { l: 'Bus', v: liveSelectedParcel.assignedBus || 'Not assigned' },
                  { l: 'Amount', v: `₹${liveSelectedParcel.amount}` },
                ].map((r) => (
                  <div key={r.l} className="p-3 rounded-xl bg-white/5">
                    <div className="text-white/40 text-xs">{r.l}</div>
                    <div className="text-white text-sm">{r.v}</div>
                  </div>
                ))}
              </div>

              {/* Conductor */}
              {liveSelectedParcel.conductorName && (
                <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-white/40 text-xs">Conductor</div>
                    <div className="text-white text-sm">{liveSelectedParcel.conductorName}</div>
                  </div>
                </div>
              )}

              {/* Route map */}
              {liveSelectedParcel.pickupLocation && liveSelectedParcel.destination && (
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Route Map</label>
                  <PuneMap
                    height="200px"
                    selectedStopNames={[
                      liveSelectedParcel.pickupLocation,
                      ...(liveSelectedParcel.intermediateStops || []),
                      liveSelectedParcel.destination,
                    ]}
                  />
                </div>
              )}

              {/* ── OTP Section ──────────────────────────────────────── */}
              {canEnterOtp && !otpSuccess && (
                <div className="p-5 rounded-2xl border-2"
                  style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.35)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h4 className="text-amber-300 font-bold">OTP Delivery Verification</h4>
                  </div>
                  <p className="text-white/50 text-xs mb-4">
                    Your parcel has arrived. Enter the 6-digit OTP the sender shared with you to confirm receipt.
                  </p>

                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <input
                        type={showOtp ? 'text' : 'password'}
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => {
                          setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setOtpError('');
                        }}
                        className="input-field font-mono text-2xl tracking-[0.3em] text-center pr-12"
                        placeholder="• • • • • •"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtp(!showOtp)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                        {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      className="btn-success px-6 flex items-center gap-2"
                      disabled={otpValue.length !== 6 || verifying}
                      onClick={handleVerifyOtp}>
                      {verifying ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle className="w-5 h-5" /> Verify</>
                      )}
                    </button>
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {otpError}
                    </div>
                  )}

                  {/* Attempt counter */}
                  {liveSelectedParcel.otpAttempts > 0 && !isLocked && (
                    <div className="mt-2 text-white/30 text-xs text-center">
                      {liveSelectedParcel.otpAttempts} / {MAX_OTP_ATTEMPTS} attempts used
                    </div>
                  )}

                  <p className="text-white/20 text-xs mt-3 text-center">
                    Platform only – no SMS sent. OTP shown on sender's booking confirmation.
                  </p>
                </div>
              )}

              {/* Locked state */}
              {isLocked && !liveSelectedParcel.isConfirmedByReceiver && (
                <div className="p-5 rounded-2xl border-2 border-red-400/30 bg-red-500/10 text-center">
                  <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h4 className="text-red-300 font-bold mb-1">OTP Locked</h4>
                  <p className="text-white/40 text-sm">
                    Too many incorrect attempts. Please contact the sender or admin to unlock.
                  </p>
                </div>
              )}

              {/* OTP success banner */}
              {(otpSuccess || liveSelectedParcel.isConfirmedByReceiver) && (
                <div className="p-5 rounded-2xl border-2 border-emerald-400/30 bg-emerald-500/10 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-emerald-300 font-bold text-lg mb-1">Delivery Confirmed ✓</h4>
                  <p className="text-white/50 text-sm">OTP verified successfully. Parcel delivered.</p>
                  {liveSelectedParcel.otpVerifiedAt && (
                    <p className="text-white/30 text-xs mt-1">
                      Verified at {new Date(liveSelectedParcel.otpVerifiedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                  <button
                    className="btn-secondary mt-4 text-sm py-2 px-5"
                    onClick={() => setShowReceipt(true)}>
                    <Printer className="w-4 h-4 inline mr-1" /> View Receipt
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Shipment Timeline</h4>
                <ShipmentTimeline timeline={liveSelectedParcel.timeline} currentStatus={liveSelectedParcel.status} />
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center h-full flex items-center justify-center text-white/30">
              <div>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a parcel to view details and enter OTP</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReceipt && liveSelectedParcel && (
        <DeliveryReceipt parcel={liveSelectedParcel} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
