export type UserRole = 'customer' | 'conductor' | 'receiver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export type ParcelStatus =
  | 'booked'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

export type ParcelType = 'documents' | 'fragile' | 'electronics' | 'clothing' | 'food' | 'other';

export interface TimelineEvent {
  status: ParcelStatus;
  timestamp: string;
  location: string;
  description: string;
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  receiverId?: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  pickupLocation: string;
  destination: string;
  intermediateStops: string[];   // ordered list of stop names between pickup and destination
  parcelType: ParcelType;
  weight: number;
  description?: string;
  status: ParcelStatus;
  assignedBus?: string;
  conductorId?: string;
  conductorName?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  estimatedDelivery: string;
  amount: number;
  // OTP workflow
  deliveryOtp: string;          // 6-digit, generated once on booking, never shown on receipts/tracking
  otpAttempts: number;          // count of wrong attempts (max 5)
  otpVerifiedAt?: string;       // ISO timestamp when OTP was successfully verified
  isConfirmedByReceiver: boolean;
}

export interface PmpmlStop {
  id: string;
  name: string;
  coords: [number, number];
  type: 'major' | 'minor' | 'depot';
}

export interface PmpmlRoute {
  id: string;
  name: string;
  stopIds: string[];            // ordered list of stop IDs
  color: string;
  busNumber?: string;
  note?: string;
}

// Kept for backward map compatibility
export interface PuneRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  waypoints: [number, number][];
  color: string;
}

export interface Bus {
  id: string;
  number: string;
  route: string;
  conductorId?: string;
  status: 'active' | 'inactive' | 'maintenance';
  currentLocation?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
