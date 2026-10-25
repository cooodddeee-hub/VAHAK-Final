import React from 'react';
import { Parcel } from '../../types';
import { Printer, X, Truck, MapPin, Package, Phone, User, Shield } from 'lucide-react';

interface Props {
  parcel: Parcel;
  onClose: () => void;
}

export default function DeliveryReceipt({ parcel, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-slide-up print-section">
        {/* Header */}
        <div className="text-white p-6" style={{ background: 'linear-gradient(135deg, #040d40, #1a237e)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-black tracking-wider">VAHAK</h1>
                <p className="text-white/60 text-xs">PMPML Parcel Service · Demo Application</p>
              </div>
            </div>
            <button onClick={onClose} className="no-print text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {parcel.isConfirmedByReceiver ? 'Delivery Receipt' : 'Booking Receipt'}
              </h2>
              <p className="text-gray-500 text-sm">Parcel Acknowledgment</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-blue-600 font-mono">{parcel.trackingNumber}</div>
              <div className={`text-sm font-semibold mt-1 ${parcel.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {parcel.status.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase text-gray-400 font-semibold mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Sender</div>
                <div className="font-semibold text-gray-800">{parcel.senderName}</div>
                {/* Phone hidden from receipt for privacy */}
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400 font-semibold mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Receiver</div>
                <div className="font-semibold text-gray-800">{parcel.receiverName}</div>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="text-xs uppercase text-gray-400 font-semibold mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Route</div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700">{parcel.pickupLocation}</div>
                {parcel.intermediateStops?.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    via {parcel.intermediateStops.join(' → ')}
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-700 mt-1">→ {parcel.destination}</div>
              </div>
            </div>
          </div>

          {/* Parcel details */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs uppercase text-gray-400 font-semibold mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Type</div>
                <div className="text-gray-700 text-sm capitalize">{parcel.parcelType}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400 font-semibold mb-1">Weight</div>
                <div className="text-gray-700 text-sm">{parcel.weight} kg</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400 font-semibold mb-1">Amount</div>
                <div className="text-emerald-600 font-bold">₹{parcel.amount}</div>
              </div>
            </div>
          </div>

          {/* Bus/conductor */}
          {parcel.assignedBus && (
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase text-gray-400 font-semibold mb-1 flex items-center gap-1"><Truck className="w-3 h-3" /> PMPML Bus</div>
                  <div className="text-gray-700 text-sm font-mono">{parcel.assignedBus}</div>
                </div>
                {parcel.conductorName && (
                  <div>
                    <div className="text-xs uppercase text-gray-400 font-semibold mb-1">Conductor</div>
                    <div className="text-gray-700 text-sm">{parcel.conductorName}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTP verification status — NEVER shows the OTP code */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Booked on</div>
                <div className="text-gray-600 text-sm">
                  {new Date(parcel.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </div>
              </div>
              {parcel.isConfirmedByReceiver ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-emerald-700 text-sm font-bold">OTP Verified ✓</div>
                    {parcel.otpVerifiedAt && (
                      <div className="text-emerald-600 text-xs">
                        {new Date(parcel.otpVerifiedAt).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                  Pending Delivery
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-gray-50 text-center text-xs text-gray-400 border border-dashed border-gray-200">
            Academic demo — VAHAK PMPML Parcel Service. Not an official PMPML document.<br />
            Data stored in browser only. OTP not displayed on this receipt.
          </div>
        </div>

        {/* Print */}
        <div className="px-6 pb-6 no-print">
          <button onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
            <Printer className="w-5 h-5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
