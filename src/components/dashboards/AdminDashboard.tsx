import React, { useState } from 'react';
import { Truck, Package, Users, BarChart3, Settings, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import { Parcel } from '../../types';

export default function AdminDashboard() {
  const { parcels, buses, users, assignBusAndConductor } = useApp();
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedConductorId, setSelectedConductorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');

  const conductors = users.filter((u) => u.role === 'conductor');
  const activeBuses = buses.filter((b) => b.status === 'active');
  const pendingAssignment = parcels.filter((p) => p.status === 'booked');
  const inProgress = parcels.filter((p) => ['assigned', 'picked_up', 'in_transit', 'arrived'].includes(p.status));
  const delivered = parcels.filter((p) => p.status === 'delivered');

  const stats = [
    { label: 'Total Parcels', value: parcels.length, color: '#3b82f6' },
    { label: 'Needs Assignment', value: pendingAssignment.length, color: '#f59e0b' },
    { label: 'In Progress', value: inProgress.length, color: '#8b5cf6' },
    { label: 'Delivered', value: delivered.length, color: '#10b981' },
    { label: 'Active Buses', value: activeBuses.length, color: '#f59e0b' },
    { label: 'Conductors', value: conductors.length, color: '#ec4899' },
  ];

  const handleAssign = async () => {
    if (!selectedParcel || !selectedBusId || !selectedConductorId) return;
    setAssigning(true);
    await new Promise((r) => setTimeout(r, 700));
    assignBusAndConductor(selectedParcel.id, selectedBusId, selectedConductorId);
    setAssigning(false);
    setAssignMsg('Assigned successfully!');
    setTimeout(() => { setAssignMsg(''); setSelectedParcel(null); setSelectedBusId(''); setSelectedConductorId(''); }, 2500);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/50 text-sm">VAHAK PMPML Parcel Service · Control Centre</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card p-3 flex items-start gap-2"
        style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
        <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-300/70 text-xs">
          Academic demo. Routes and buses are illustrative and not official PMPML schedules.
          Delivery requires receiver OTP — conductors cannot bypass this.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
            <div className="w-full h-0.5 rounded-full mt-2 opacity-50" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Assignment panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Needs Assignment</h2>
            {pendingAssignment.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                {pendingAssignment.length}
              </span>
            )}
          </div>
          {pendingAssignment.length === 0 ? (
            <div className="glass-card p-6 text-center text-white/30 text-sm">All parcels assigned ✓</div>
          ) : (
            pendingAssignment.map((p) => (
              <div key={p.id}
                className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:border-amber-400/40 ${selectedParcel?.id === p.id ? 'border-amber-400/60 bg-amber-500/10' : ''}`}
                onClick={() => { setSelectedParcel(p); setAssignMsg(''); }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-blue-300 text-sm font-bold">{p.trackingNumber}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <p className="text-white/60 text-xs">{p.pickupLocation} → {p.destination}</p>
                {p.intermediateStops?.length > 0 && (
                  <p className="text-white/30 text-xs">via {p.intermediateStops.join(', ')}</p>
                )}
                <p className="text-white/30 text-xs mt-1">{formatDate(p.createdAt)} · ₹{p.amount}</p>
              </div>
            ))
          )}
        </div>

        {/* Assignment panel */}
        <div className="lg:col-span-2">
          {selectedParcel ? (
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-lg font-bold text-white">
                Assign: <span className="text-blue-300">{selectedParcel.trackingNumber}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { l: 'From', v: selectedParcel.pickupLocation },
                  { l: 'To', v: selectedParcel.destination },
                  { l: 'Via', v: selectedParcel.intermediateStops?.length ? selectedParcel.intermediateStops.join(' → ') : 'Direct' },
                  { l: 'Sender', v: selectedParcel.senderName },
                  { l: 'Receiver', v: selectedParcel.receiverName },
                  { l: 'Type · Weight', v: `${selectedParcel.parcelType} · ${selectedParcel.weight}kg` },
                ].map((r) => (
                  <div key={r.l} className="p-3 rounded-xl bg-white/5">
                    <div className="text-white/40 text-xs">{r.l}</div>
                    <div className="text-white capitalize text-sm">{r.v}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Select PMPML Bus</label>
                  <select className="input-field" value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}>
                    <option value="" className="bg-[#0d1b60]">Choose a bus…</option>
                    {activeBuses.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#0d1b60]">
                        {b.number} · {b.route}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Select Conductor</label>
                  <select className="input-field" value={selectedConductorId}
                    onChange={(e) => setSelectedConductorId(e.target.value)}>
                    <option value="" className="bg-[#0d1b60]">Choose a conductor…</option>
                    {conductors.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0d1b60]">
                        {c.name} · {c.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {assignMsg ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-center font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> {assignMsg}
                </div>
              ) : (
                <button className="btn-primary w-full flex items-center justify-center gap-2"
                  disabled={!selectedBusId || !selectedConductorId || assigning}
                  onClick={handleAssign}>
                  {assigning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Truck className="w-5 h-5" /> Assign Bus & Conductor</>}
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 text-center h-full flex items-center justify-center text-white/30">
              <div>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a pending parcel to assign</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All parcels table */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">All Parcels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Tracking', 'Sender', 'Route', 'Type', 'Bus', 'Status', 'OTP', 'Amount'].map((h) => (
                  <th key={h} className="text-white/40 text-left pb-3 pr-4 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parcels.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 font-mono text-blue-300 text-xs">{p.trackingNumber}</td>
                  <td className="py-3 pr-4 text-white/70 text-xs">{p.senderName}</td>
                  <td className="py-3 pr-4 text-white/50 text-xs">{p.pickupLocation.split(' ')[0]} → {p.destination.split(' ')[0]}</td>
                  <td className="py-3 pr-4 text-white/50 capitalize text-xs">{p.parcelType}</td>
                  <td className="py-3 pr-4 text-white/50 text-xs font-mono">{p.assignedBus || '—'}</td>
                  <td className="py-3 pr-4"><StatusBadge status={p.status} size="sm" /></td>
                  <td className="py-3 pr-4">
                    {p.isConfirmedByReceiver
                      ? <span className="text-emerald-400 text-xs flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>
                      : p.otpAttempts >= 5
                      ? <span className="text-red-400 text-xs">Locked</span>
                      : <span className="text-white/30 text-xs">Pending</span>
                    }
                  </td>
                  <td className="py-3 text-emerald-400 font-semibold text-sm">₹{p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet table */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Truck className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">PMPML Fleet (Demo)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Bus', 'Demo Route', 'Status', 'Location'].map((h) => (
                  <th key={h} className="text-white/40 text-left pb-3 pr-4 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {buses.map((b) => (
                <tr key={b.id} className="hover:bg-white/5">
                  <td className="py-3 pr-4 font-mono text-white font-semibold text-xs">{b.number}</td>
                  <td className="py-3 pr-4 text-white/60 text-xs">{b.route}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      b.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                      b.status === 'inactive' ? 'bg-white/10 text-white/40' : 'bg-amber-500/20 text-amber-300'
                    }`}>{b.status}</span>
                  </td>
                  <td className="py-3 text-white/50 text-xs">{b.currentLocation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
