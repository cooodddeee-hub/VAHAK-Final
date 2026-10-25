import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Parcel, Bus, Notification } from '../types';
import {
  DEMO_USERS, SAMPLE_PARCELS, DEMO_BUSES, SAMPLE_NOTIFICATIONS,
} from '../data/sampleData';

// Bump version when the schema changes to avoid stale localStorage conflicts
const SCHEMA_VERSION = 'v2';

const STORAGE_KEYS = {
  PARCELS:       `vahak_${SCHEMA_VERSION}_parcels`,
  BUSES:         `vahak_${SCHEMA_VERSION}_buses`,
  NOTIFICATIONS: `vahak_${SCHEMA_VERSION}_notifications`,
  USER:          `vahak_${SCHEMA_VERSION}_current_user`,
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface OtpResult {
  success: boolean;
  message: string;
  locked?: boolean;
}

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  parcels: Parcel[];
  buses: Bus[];
  notifications: Notification[];
  users: User[];
  addParcel: (parcel: Parcel) => void;
  updateParcel: (id: string, updates: Partial<Parcel>) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  /** OTP-gated delivery confirmation – replaces the old one-click confirmDelivery */
  verifyOtpAndDeliver: (parcelId: string, enteredOtp: string) => OtpResult;
  assignBusAndConductor: (parcelId: string, busId: string, conductorId: string) => void;
  updateParcelStatus: (parcelId: string, status: Parcel['status'], location: string, description: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore quota errors */ }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage(STORAGE_KEYS.USER, null)
  );
  const [parcels, setParcels] = useState<Parcel[]>(() =>
    loadFromStorage(STORAGE_KEYS.PARCELS, SAMPLE_PARCELS)
  );
  const [buses, setBuses] = useState<Bus[]>(() =>
    loadFromStorage(STORAGE_KEYS.BUSES, DEMO_BUSES)
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, SAMPLE_NOTIFICATIONS)
  );
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => { saveToStorage(STORAGE_KEYS.PARCELS, parcels); }, [parcels]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BUSES, buses); }, [buses]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.USER, currentUser); }, [currentUser]);

  // ── Auth ──────────────────────────────────────────────────────────────
  const login = (email: string, password: string) => {
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) { setCurrentUser(user); setActiveTab('dashboard'); return { success: true, message: 'Login successful' }; }
    return { success: false, message: 'Invalid credentials. Use the demo accounts.' };
  };

  const logout = () => { setCurrentUser(null); setActiveTab('dashboard'); };

  // ── Core CRUD ─────────────────────────────────────────────────────────
  const addParcel = (parcel: Parcel) => setParcels((prev) => [parcel, ...prev]);

  const updateParcel = (id: string, updates: Partial<Parcel>) =>
    setParcels((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

  const addNotification = (notif: Omit<Notification, 'id' | 'createdAt'>) => {
    const n: Notification = { ...notif, id: `n${Date.now()}`, createdAt: new Date().toISOString() };
    setNotifications((prev) => [n, ...prev]);
  };

  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

  const markAllNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  // ── OTP-gated delivery ────────────────────────────────────────────────
  const verifyOtpAndDeliver = (parcelId: string, enteredOtp: string): OtpResult => {
    // Read the latest parcel snapshot from state via closure trick
    let result: OtpResult = { success: false, message: 'Parcel not found.' };

    setParcels((prev) => {
      const parcel = prev.find((p) => p.id === parcelId);
      if (!parcel) return prev;

      // Already delivered
      if (parcel.isConfirmedByReceiver || parcel.status === 'delivered') {
        result = { success: false, message: 'This parcel has already been delivered and confirmed.' };
        return prev;
      }

      // Locked
      if (parcel.otpAttempts >= 5) {
        result = { success: false, message: 'Too many failed attempts. Contact the sender or admin.', locked: true };
        return prev;
      }

      const now = new Date().toISOString();

      // Wrong OTP
      if (enteredOtp.trim() !== parcel.deliveryOtp) {
        const attempts = parcel.otpAttempts + 1;
        const remaining = 5 - attempts;
        result = {
          success: false,
          message: remaining > 0
            ? `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
            : 'Too many failed attempts. Contact the sender or admin.',
          locked: remaining <= 0,
        };
        return prev.map((p) => p.id === parcelId ? { ...p, otpAttempts: attempts } : p);
      }

      // ✅ Correct OTP
      result = { success: true, message: 'OTP verified! Delivery confirmed.' };

      // Schedule notifications after state update (micro-task)
      setTimeout(() => {
        addNotification({
          userId: parcel.senderId,
          title: '✅ Delivery Confirmed',
          message: `Parcel ${parcel.trackingNumber} was OTP-verified and delivered to ${parcel.receiverName}.`,
          type: 'success', isRead: false,
        });
        if (parcel.receiverId) {
          addNotification({
            userId: parcel.receiverId,
            title: '✅ Delivery Complete',
            message: `Your parcel ${parcel.trackingNumber} has been confirmed. Thank you!`,
            type: 'success', isRead: false,
          });
        }
        addNotification({
          userId: 'u4', // admin
          title: 'Delivery Confirmed',
          message: `${parcel.trackingNumber}: OTP verified by receiver at ${now}.`,
          type: 'info', isRead: false,
        });
      }, 0);

      return prev.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              status: 'delivered',
              isConfirmedByReceiver: true,
              otpVerifiedAt: now,
              otpAttempts: p.otpAttempts, // don't change — was correct
              timeline: [
                ...p.timeline,
                {
                  status: 'delivered',
                  timestamp: now,
                  location: p.destination,
                  description: 'OTP verified by receiver — delivery complete',
                },
              ],
            }
          : p
      );
    });

    return result;
  };

  // ── Admin: assign bus + conductor ─────────────────────────────────────
  const assignBusAndConductor = (parcelId: string, busId: string, conductorId: string) => {
    const bus = buses.find((b) => b.id === busId);
    const conductor = DEMO_USERS.find((u) => u.id === conductorId);
    const parcel = parcels.find((p) => p.id === parcelId);
    if (!bus || !conductor || !parcel) return;

    const now = new Date().toISOString();
    updateParcel(parcelId, {
      assignedBus: bus.number,
      conductorId: conductor.id,
      conductorName: conductor.name,
      status: 'assigned',
      timeline: [
        ...parcel.timeline,
        {
          status: 'assigned',
          timestamp: now,
          location: parcel.pickupLocation,
          description: `Assigned to bus ${bus.number}, conductor ${conductor.name}`,
        },
      ],
    });
    setBuses((prev) => prev.map((b) => b.id === busId ? { ...b, conductorId } : b));
    addNotification({ userId: conductorId, title: 'New Assignment', message: `${parcel.trackingNumber} assigned to you on bus ${bus.number}. Route: ${parcel.pickupLocation} → ${parcel.destination}.`, type: 'info', isRead: false });
    addNotification({ userId: parcel.senderId, title: 'Bus Assigned', message: `Bus ${bus.number} assigned to your parcel ${parcel.trackingNumber}.`, type: 'success', isRead: false });
  };

  // ── Conductor: update transport status (cannot mark Delivered) ────────
  const updateParcelStatus = (
    parcelId: string, status: Parcel['status'], location: string, description: string
  ) => {
    // Block conductor from bypassing OTP
    if (status === 'delivered') return;

    const now = new Date().toISOString();
    const parcel = parcels.find((p) => p.id === parcelId);
    if (!parcel) return;

    updateParcel(parcelId, {
      status,
      timeline: [...parcel.timeline, { status, timestamp: now, location, description }],
    });
    addNotification({ userId: parcel.senderId, title: 'Shipment Update', message: `${parcel.trackingNumber}: ${description}`, type: 'info', isRead: false });
    if (parcel.receiverId) {
      addNotification({ userId: parcel.receiverId, title: 'Shipment Update', message: `Your parcel ${parcel.trackingNumber}: ${description}`, type: 'info', isRead: false });
    }
  };

  const unreadCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.isRead
  ).length;

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      parcels, buses, notifications, users: DEMO_USERS,
      addParcel, updateParcel,
      addNotification, markNotificationRead, markAllNotificationsRead,
      verifyOtpAndDeliver,
      assignBusAndConductor, updateParcelStatus,
      activeTab, setActiveTab, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
