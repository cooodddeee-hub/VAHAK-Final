import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CustomerDashboard from './components/dashboards/CustomerDashboard';
import ConductorDashboard from './components/dashboards/ConductorDashboard';
import ReceiverDashboard from './components/dashboards/ReceiverDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import BookingForm from './components/BookingForm';
import PuneMap from './components/maps/PuneMap';

function AppContent() {
  const { currentUser, activeTab } = useApp();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;
  if (!currentUser) return <LandingPage />;

  const renderContent = () => {
    if (activeTab === 'book' && currentUser.role === 'customer') return <BookingForm />;
    if (activeTab === 'map') return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-2">Pune PMPML Routes — Live Map</h2>
        <p className="text-white/40 text-sm mb-5">Illustrative demo routes using Pune city stops. Not official PMPML schedules.</p>
        <PuneMap height="500px" showAllRoutes />
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300 text-sm space-y-1">
          <p>⚠️ Map tiles require an internet connection (OpenStreetMap).</p>
          <p>⚠️ Routes are straight-line visualisations — not road-following. This is a demo limitation.</p>
          <p>⚠️ Bus positions are simulated. No real GPS tracking is implemented.</p>
        </div>
      </div>
    );

    switch (currentUser.role) {
      case 'customer':  return <CustomerDashboard />;
      case 'conductor': return <ConductorDashboard />;
      case 'receiver':  return <ReceiverDashboard />;
      case 'admin':     return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #040d40 0%, #0d1b60 50%, #1a237e 100%)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10"
          style={{ background: 'rgba(4,13,64,0.9)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-1">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <span className="text-white font-black text-lg tracking-wider">VAHAK</span>
            <span className="text-white/30 text-xs ml-2">PMPML</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Desktop navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
