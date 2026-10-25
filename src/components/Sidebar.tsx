import React from 'react';
import {
  LayoutDashboard, Package, Map, Users, Settings,
  Truck, LogOut, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['customer', 'conductor', 'receiver', 'admin'] },
  { id: 'book', label: 'Book Parcel', icon: <Package className="w-5 h-5" />, roles: ['customer'] },
  { id: 'map', label: 'Live Map', icon: <Map className="w-5 h-5" />, roles: ['customer', 'conductor', 'admin'] },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
];

const ROLE_COLORS: Record<UserRole, string> = {
  customer: '#3b82f6',
  conductor: '#10b981',
  receiver: '#f59e0b',
  admin: '#8b5cf6',
};

export default function Sidebar() {
  const { currentUser, activeTab, setActiveTab, logout } = useApp();
  if (!currentUser) return null;

  const color = ROLE_COLORS[currentUser.role];
  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 z-20 flex flex-col border-r border-white/10"
      style={{ background: 'rgba(4,13,64,0.95)', backdropFilter: 'blur(20px)' }}>
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-black text-white tracking-wider">VAHAK</div>
            <div className="text-white/30 text-xs">Parcel Service</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="p-4 mx-3 mt-4 rounded-2xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: color }}>
            {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm truncate">{currentUser.name}</div>
            <div className="text-xs capitalize font-medium" style={{ color }}>{currentUser.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-white/25 text-xs uppercase tracking-wider px-3 mb-3 mt-2">Navigation</p>
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-tab w-full text-left ${isActive ? 'nav-tab-active' : 'nav-tab-inactive'}`}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="nav-tab nav-tab-inactive w-full text-left hover:bg-red-500/15 hover:text-red-300 group">
          <LogOut className="w-5 h-5 group-hover:text-red-300" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
