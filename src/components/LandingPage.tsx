import React, { useState } from 'react';
import { Truck, Package, MapPin, Clock, Shield, Star, ChevronRight, ArrowRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LoginModal from './LoginModal';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const { currentUser } = useApp();

  const stats = [
    { value: 'Pune', label: 'City Focus' },
    { value: 'PMPML', label: 'Bus Network' },
    { value: 'OTP', label: 'Verified Delivery' },
    { value: 'Demo', label: 'Academic Project' },
  ];

  const features = [
    {
      icon: <MapPin className="w-7 h-7" />,
      title: 'Pune PMPML Routes',
      desc: 'Illustrative Pune city bus stops and routes. Multi-stop selection on an interactive OpenStreetMap.',
      color: '#3b82f6',
    },
    {
      icon: <Package className="w-7 h-7" />,
      title: 'Easy Booking',
      desc: 'Book a parcel in minutes — set stops, receiver details, and parcel type.',
      color: '#8b5cf6',
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: 'OTP Delivery',
      desc: 'A 6-digit OTP is generated at booking. The receiver must verify it to confirm handover.',
      color: '#10b981',
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: 'Role Dashboards',
      desc: 'Separate views for Customer, Conductor, Receiver, and Admin with live status updates.',
      color: '#f59e0b',
    },
  ];

  const routes = [
    { from: 'Swargate', to: 'Hadapsar', note: 'via Pune Station' },
    { from: 'Shivajinagar', to: 'Nigdi', note: 'via Aundh, Wakad' },
    { from: 'Katraj', to: 'Hinjawadi', note: 'via Deccan, Shivajinagar' },
    { from: 'Hadapsar', to: 'Pimpri', note: 'via Chinchwad' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #040d40 0%, #0d1b60 40%, #1a237e 100%)' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(4,13,64,0.85)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-wider">VAHAK</span>
              <span className="text-white/30 text-xs ml-2">PMPML Pune</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-white/60 text-sm font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">Features</span>
            <span className="hover:text-white cursor-pointer transition-colors">Routes</span>
            <span className="hover:text-white cursor-pointer transition-colors">How it Works</span>
          </div>
          <button onClick={() => setShowLogin(true)} className="btn-primary flex items-center gap-2">
            {currentUser ? 'Dashboard' : 'Login'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 text-sm font-medium mb-8 animate-fade-in">
          <Star className="w-4 h-4" />
          Academic Demo · Pune PMPML Parcel Concept
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
          Pune Parcel via
          <span className="block" style={{ WebkitTextStroke: '2px #3b82f6', color: 'transparent' }}>
            PMPML Buses
          </span>
        </h1>
        <p className="text-white/60 text-xl max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in">
          A demo application exploring last-mile parcel delivery coordination
          using Pune's city bus network. OTP-verified handover, multi-stop routes,
          and role-based dashboards.
        </p>
        <p className="text-white/30 text-sm max-w-xl mx-auto mb-10">
          ⚠️ This is an academic concept demo. Not an official PMPML service.
          PMPML does not currently offer a commercial parcel delivery programme.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <button onClick={() => setShowLogin(true)} className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
            Explore Demo <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => setShowLogin(true)} className="btn-secondary text-lg px-8 py-4">
            Track Parcel
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="glass-card p-6 hover:border-white/40 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${feat.color}20`, border: `1px solid ${feat.color}40` }}>
                <span style={{ color: feat.color }}>{feat.icon}</span>
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pune Routes */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Demo Pune Routes</h2>
        <p className="text-white/30 text-sm text-center mb-10">Illustrative stops — not official PMPML schedules</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((route, i) => (
            <div key={i} className="glass-card p-5 hover:border-blue-400/40 cursor-pointer transition-all duration-200 group"
              onClick={() => setShowLogin(true)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold text-sm">{route.from}</span>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                <span className="text-white font-bold text-sm">{route.to}</span>
              </div>
              <p className="text-white/30 text-xs">{route.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OTP Workflow */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">OTP Delivery Workflow</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Book', desc: 'Customer books a parcel and receives a 6-digit OTP', icon: '📦' },
            { step: '2', title: 'Assign', desc: 'Admin assigns a PMPML bus and conductor', icon: '🚌' },
            { step: '3', title: 'Transit', desc: 'Conductor picks up and delivers to destination stop', icon: '🛣️' },
            { step: '4', title: 'Verify', desc: 'Receiver enters OTP to confirm handover', icon: '🔐' },
          ].map((w, i) => (
            <div key={i} className="glass-card p-5 text-center relative">
              <div className="text-3xl mb-3">{w.icon}</div>
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {w.step}
              </div>
              <h3 className="text-white font-bold mb-2">{w.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="glass-card p-8 text-center border-blue-400/30">
          <h2 className="text-2xl font-bold text-white mb-3">Try the Demo</h2>
          <p className="text-white/60 mb-6">Four pre-loaded demo accounts — click any to auto-fill credentials</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { role: 'Customer', email: 'customer@vahak.in', color: '#3b82f6' },
              { role: 'Conductor', email: 'conductor@vahak.in', color: '#10b981' },
              { role: 'Receiver', email: 'receiver@vahak.in', color: '#f59e0b' },
              { role: 'Admin', email: 'admin@vahak.in', color: '#8b5cf6' },
            ].map((acc, i) => (
              <div key={i} className="p-3 rounded-xl border text-left"
                style={{ borderColor: `${acc.color}40`, background: `${acc.color}15` }}>
                <div className="text-xs font-bold mb-1" style={{ color: acc.color }}>{acc.role}</div>
                <div className="text-white/50 text-xs truncate">{acc.email}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowLogin(true)} className="btn-primary text-lg px-10 py-4">
            Start Demo →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Truck className="w-4 h-4" />
          <span className="font-bold text-white/50">VAHAK · PMPML Pune Demo</span>
        </div>
        <p>Academic project. Not affiliated with or endorsed by PMPML or Maharashtra government.</p>
        <p className="mt-1">Data stored in browser localStorage only. Map tiles require internet. OTP is not sent via SMS.</p>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
