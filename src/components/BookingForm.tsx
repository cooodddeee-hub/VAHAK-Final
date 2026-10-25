import React, { useState } from 'react';
import { Package, User, Phone, Mail, Weight, ChevronRight, CheckCircle, Copy, Shield, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Parcel, ParcelType } from '../types';
import StopRoutePicker from './maps/StopRoutePicker';
import PuneMap from './maps/PuneMap';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const PARCEL_TYPES: { value: ParcelType; label: string; icon: string }[] = [
  { value: 'documents',   label: 'Documents',   icon: '📄' },
  { value: 'fragile',     label: 'Fragile',     icon: '🏺' },
  { value: 'electronics', label: 'Electronics', icon: '💻' },
  { value: 'clothing',    label: 'Clothing',    icon: '👗' },
  { value: 'food',        label: 'Food',        icon: '🍱' },
  { value: 'other',       label: 'Other',       icon: '📦' },
];

const TYPE_CHARGE: Record<ParcelType, number> = {
  documents: 0, fragile: 80, electronics: 120, clothing: 40, food: 60, other: 20,
};

export default function BookingForm() {
  const { currentUser, addParcel, addNotification, setActiveTab } = useApp();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookedParcel, setBookedParcel] = useState<Parcel | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Stops: [origin, ...intermediates, destination]
  const [stops, setStops] = useState<string[]>(['', '']);

  const [form, setForm] = useState({
    senderName: currentUser?.name || '',
    senderPhone: currentUser?.phone || '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    parcelType: 'documents' as ParcelType,
    weight: '',
    description: '',
  });

  const calcAmount = () => {
    const base = 80;
    const weightCharge = parseFloat(form.weight || '0') * 30;
    return Math.round(base + weightCharge + (TYPE_CHARGE[form.parcelType] || 0));
  };

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validStops = stops.filter(Boolean);
  const pickupLocation = stops[0] || '';
  const destination = stops[stops.length - 1] || '';
  const intermediateStops = stops.slice(1, -1).filter(Boolean);

  const canProceedStep1 = form.senderName && form.senderPhone && form.receiverName && form.receiverPhone;
  const canProceedStep2 = validStops.length >= 2 && validStops[0] && validStops[validStops.length - 1] && form.weight;

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const id = `p${Date.now()}`;
    const tracking = `VHK-PUNE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = generateOtp(); // generated once — stored on parcel, never re-generated
    const now = new Date().toISOString();
    const eta = new Date(Date.now() + 6 * 3600 * 1000).toISOString();

    const newParcel: Parcel = {
      id,
      trackingNumber: tracking,
      senderId: currentUser!.id,
      senderName: form.senderName,
      senderPhone: form.senderPhone,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      receiverEmail: form.receiverEmail || undefined,
      pickupLocation,
      destination,
      intermediateStops,
      parcelType: form.parcelType,
      weight: parseFloat(form.weight) || 1,
      description: form.description || undefined,
      status: 'booked',
      timeline: [{ status: 'booked', timestamp: now, location: pickupLocation, description: 'Booking confirmed via VAHAK PMPML Platform' }],
      createdAt: now,
      estimatedDelivery: eta,
      amount: calcAmount(),
      deliveryOtp: otp,
      otpAttempts: 0,
      isConfirmedByReceiver: false,
    };

    addParcel(newParcel);
    addNotification({
      userId: currentUser!.id,
      title: '✅ Booking Confirmed',
      message: `${tracking} booked: ${pickupLocation} → ${destination}. Share the OTP with your receiver to complete delivery.`,
      type: 'success',
      isRead: false,
    });
    // Notify admin
    addNotification({
      userId: 'u4',
      title: 'New Booking – Assignment Needed',
      message: `${tracking} (${pickupLocation} → ${destination}) needs a bus and conductor.`,
      type: 'warning',
      isRead: false,
    });

    setSubmitting(false);
    setBookedParcel(newParcel);
  };

  const copyToClipboard = (text: string, type: 'otp' | 'ref') => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === 'otp') { setCopiedOtp(true); setTimeout(() => setCopiedOtp(false), 2000); }
    else { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); }
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (bookedParcel) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in space-y-4">
        {/* Header */}
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
          <p className="text-white/50 text-sm">Share the OTP below with your receiver to complete delivery</p>
        </div>

        {/* Reference + OTP */}
        <div className="glass-card p-6 space-y-4">
          {/* Shipment Ref */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
            <div className="text-blue-300 text-xs uppercase tracking-wider mb-1">Shipment Reference</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-white text-xl font-bold">{bookedParcel.trackingNumber}</span>
              <button
                onClick={() => copyToClipboard(bookedParcel.trackingNumber, 'ref')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs transition-all">
                <Copy className="w-3 h-3" />
                {copiedRef ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* OTP — only shown to sender right after booking */}
          <div className="p-4 rounded-xl border-2" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.4)' }}>
            <div className="flex items-center gap-2 text-amber-300 text-xs uppercase tracking-wider mb-2">
              <Shield className="w-3 h-3" />
              Delivery OTP — Share with Receiver Only
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-amber-300 text-3xl font-black tracking-widest">
                {bookedParcel.deliveryOtp}
              </span>
              <button
                onClick={() => copyToClipboard(bookedParcel.deliveryOtp, 'otp')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs transition-all">
                <Copy className="w-3 h-3" />
                {copiedOtp ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-start gap-2 mt-3 p-2 rounded-lg bg-white/5">
              <Info className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-white/30 text-xs leading-relaxed">
                The receiver must enter this OTP to confirm delivery. This OTP is not shown elsewhere. This is a platform — no SMS is actually sent.
              </p>
            </div>
          </div>

          {/* Route summary */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { l: 'From', v: bookedParcel.pickupLocation },
              { l: 'To', v: bookedParcel.destination },
              { l: 'Stops', v: bookedParcel.intermediateStops.length > 0 ? bookedParcel.intermediateStops.join(', ') : 'Direct' },
              { l: 'Amount', v: `₹${bookedParcel.amount}` },
            ].map((r) => (
              <div key={r.l} className="p-3 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs">{r.l}</div>
                <div className="text-white text-sm">{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini map */}
        <div className="glass-card p-4">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Route Preview</h3>
          <PuneMap
            height="220px"
            selectedStopNames={[bookedParcel.pickupLocation, ...bookedParcel.intermediateStops, bookedParcel.destination]}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn-primary flex-1" onClick={() => setActiveTab('dashboard')}>
            View Dashboard
          </button>
          <button className="btn-secondary flex-1" onClick={() => {
            setBookedParcel(null); setStep(1);
            setStops(['', '']);
            setForm({ senderName: currentUser?.name || '', senderPhone: currentUser?.phone || '', receiverName: '', receiverPhone: '', receiverEmail: '', parcelType: 'documents', weight: '', description: '' });
          }}>
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // ── Booking form ───────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Parties' },
          { n: 2, label: 'Route & Parcel' },
          { n: 3, label: 'Confirm' },
        ].map(({ n, label }, idx) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              step === n ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
              step > n ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'
            }`}>
              {step > n ? <CheckCircle className="w-4 h-4" /> : <span>{n}</span>}
              <span className="hidden md:inline">{label}</span>
            </div>
            {idx < 2 && <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <div className="glass-card p-6 md:p-8">

        {/* ── Step 1: Parties ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Sender & Receiver</h2>
              <p className="text-white/40 text-sm">Enter contact details for both parties</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1 block"><User className="w-3 h-3" /> Sender Name</label>
                <input className="input-field" value={form.senderName} onChange={(e) => update('senderName', e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1 block"><Phone className="w-3 h-3" /> Sender Phone</label>
                <input className="input-field" value={form.senderPhone} onChange={(e) => update('senderPhone', e.target.value)} placeholder="10-digit mobile" />
              </div>
            </div>

            <div className="border-t border-white/10 pt-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1 block"><User className="w-3 h-3" /> Receiver Name</label>
                  <input className="input-field" value={form.receiverName} onChange={(e) => update('receiverName', e.target.value)} placeholder="Receiver full name" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1 block"><Phone className="w-3 h-3" /> Receiver Phone</label>
                  <input className="input-field" value={form.receiverPhone} onChange={(e) => update('receiverPhone', e.target.value)} placeholder="Receiver mobile" />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1 block"><Mail className="w-3 h-3" /> Receiver Email (optional)</label>
                <input className="input-field" value={form.receiverEmail} onChange={(e) => update('receiverEmail', e.target.value)} placeholder="receiver@example.com" />
              </div>
            </div>

            <button className="btn-primary w-full" disabled={!canProceedStep1} onClick={() => setStep(2)}>
              Next: Route & Parcel →
            </button>
          </div>
        )}

        {/* ── Step 2: Route + Parcel ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Route & Parcel Details</h2>
              <p className="text-white/40 text-sm">Select PMPML stops and parcel info</p>
            </div>

            <div>
              <label className="text-white/60 text-sm uppercase tracking-wider font-semibold mb-3 block">Route Stops</label>
              <StopRoutePicker stops={stops} onChange={setStops} />
            </div>

            {/* Live mini map */}
            {validStops.length >= 2 && (
              <div>
                <label className="text-white/40 text-xs mb-2 block uppercase tracking-wider">Route Preview (illustrative)</label>
                <PuneMap height="200px" selectedStopNames={validStops} />
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <label className="text-white/60 text-sm mb-3 block">Parcel Type</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {PARCEL_TYPES.map((type) => (
                  <button key={type.value} type="button"
                    onClick={() => update('parcelType', type.value)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                      form.parcelType === type.value
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'
                    }`}>
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1 block"><Weight className="w-3 h-3" /> Weight (kg)</label>
                <input className="input-field" type="number" min="0.1" step="0.1" value={form.weight}
                  onChange={(e) => update('weight', e.target.value)} placeholder="e.g., 2.5" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">Description (optional)</label>
                <input className="input-field" value={form.description}
                  onChange={(e) => update('description', e.target.value)} placeholder="Brief description" />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary flex-1" disabled={!canProceedStep2} onClick={() => setStep(3)}>
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Confirm ──────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Review & Confirm</h2>
              <p className="text-white/40 text-sm">A 6-digit delivery OTP will be generated on confirmation</p>
            </div>

            {[
              { label: 'Sender',   value: `${form.senderName} · ${form.senderPhone}` },
              { label: 'Receiver', value: `${form.receiverName} · ${form.receiverPhone}` },
              { label: 'Pickup',   value: pickupLocation },
              { label: 'Via',      value: intermediateStops.length > 0 ? intermediateStops.join(' → ') : 'Direct' },
              { label: 'Destination', value: destination },
              { label: 'Type',     value: form.parcelType },
              { label: 'Weight',   value: `${form.weight} kg` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/50 text-sm">{row.label}</span>
                <span className="text-white text-sm font-medium capitalize">{row.value}</span>
              </div>
            ))}

            <div className="flex justify-between items-center py-3 px-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span className="text-emerald-300 font-semibold">Estimated Charge</span>
              <span className="text-emerald-400 text-2xl font-black">₹{calcAmount()}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300 text-xs">
                A unique 6-digit delivery OTP will be generated. Share it only with your receiver to complete handover.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-success flex-1 flex items-center justify-center gap-2"
                disabled={submitting} onClick={handleSubmit}>
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Package className="w-5 h-5" /> Confirm & Get OTP</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
