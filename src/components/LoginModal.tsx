import React, { useState } from 'react';
import { X, Truck, Eye, EyeOff, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEMO_ACCOUNTS = [
  { role: 'Customer', email: 'customer@vahak.in', password: 'customer123', color: '#3b82f6', desc: 'Book & track parcels' },
  { role: 'Conductor', email: 'conductor@vahak.in', password: 'conductor123', color: '#10b981', desc: 'Manage shipments' },
  { role: 'Receiver', email: 'receiver@vahak.in', password: 'receiver123', color: '#f59e0b', desc: 'Confirm delivery' },
  { role: 'Admin', email: 'admin@vahak.in', password: 'admin123', color: '#8b5cf6', desc: 'Full control' },
];

interface Props { onClose: () => void; }

export default function LoginModal({ onClose }: Props) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  const fillAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md animate-slide-up glass-card p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to VAHAK</h2>
          <p className="text-white/50 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Demo accounts */}
        <div className="mb-6">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Quick Login (Demo Accounts)</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc, i) => (
              <button key={i} onClick={() => fillAccount(acc)}
                className="p-3 rounded-xl border text-left transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: `${acc.color}40`, background: `${acc.color}15` }}>
                <div className="text-xs font-bold" style={{ color: acc.color }}>{acc.role}</div>
                <div className="text-white/40 text-xs mt-0.5">{acc.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="relative">
            <label className="text-white/60 text-sm mb-1.5 block">Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="••••••••"
              required
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 bottom-3.5 text-white/40 hover:text-white transition-colors">
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-white/25 text-xs text-center mt-5">
          ⚠️ Demo only. Not secure. Uses browser localStorage.
        </p>
      </div>
    </div>
  );
}
