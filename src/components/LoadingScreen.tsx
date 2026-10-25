import React, { useEffect, useState } from 'react';
import { Truck, Package, Shield } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = ['Initializing systems…', 'Loading routes…', 'Syncing data…', 'Ready!'];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        setPhase(Math.floor((next / 100) * phases.length));
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #040d40 0%, #0d1b60 50%, #1a237e 100%)' }}>
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animationDelay: '1.5s' }} />

      <div className="text-center z-10 animate-fade-in">
        {/* Logo */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Truck className="w-14 h-14 text-white animate-float" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-6xl font-black tracking-wider text-white mb-2"
          style={{ textShadow: '0 0 40px rgba(59,130,246,0.8)' }}>
          VAHAK
        </h1>
        <p className="text-blue-300 text-lg font-medium mb-1">Smart Transport & Logistics</p>
        <p className="text-white/40 text-sm mb-10">Pune, Maharashtra</p>

        {/* Features */}
        <div className="flex gap-6 justify-center mb-10">
          {['Live Tracking', 'Parcel Booking', 'Admin Control'].map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
              <Package className="w-4 h-4 text-blue-400" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-80 mx-auto">
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 12px rgba(59,130,246,0.7)',
              }}
            />
          </div>
          <div className="flex justify-between mt-3 text-white/40 text-xs">
            <span>{phases[Math.min(phase, phases.length - 1)]}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
