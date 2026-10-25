import React, { useState } from 'react';
import { Bell, LogOut, Truck, ChevronDown, X, Check, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentUser, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!currentUser) return null;

  const userNotifs = notifications.filter((n) => n.userId === currentUser.id).slice(0, 10);

  const roleColors: Record<string, string> = {
    customer: '#3b82f6',
    conductor: '#10b981',
    receiver: '#f59e0b',
    admin: '#8b5cf6',
  };

  const color = roleColors[currentUser.role] || '#3b82f6';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const notifTypeIcon = (type: string) => {
    const icons: Record<string, string> = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
    return icons[type] || 'ℹ️';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10"
      style={{ backdropFilter: 'blur(20px)', background: 'rgba(4,13,64,0.85)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-wider">VAHAK</span>
          <span className="hidden md:inline-block text-white/30 text-xs">Final</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-14 w-80 glass-card p-0 overflow-hidden shadow-2xl animate-fade-in z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsRead}
                        className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors">
                        <CheckCheck className="w-3 h-3" /> All read
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <div className="py-8 text-center text-white/40 text-sm">No notifications</div>
                  ) : (
                    userNotifs.map((n) => (
                      <div key={n.id}
                        className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                        onClick={() => markNotificationRead(n.id)}>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">{notifTypeIcon(n.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-white text-sm font-medium truncate">{n.title}</p>
                              {!n.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 ml-2" />}
                            </div>
                            <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-white/25 text-xs mt-1">{formatTime(n.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: color }}>
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-white text-sm font-semibold leading-tight">{currentUser.name}</div>
              <div className="text-white/40 text-xs capitalize">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/30 hidden md:block" />
          </div>

          {/* Logout */}
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white/60 text-sm transition-all duration-200">
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
