import { User, Parcel, Bus, Notification, PmpmlStop, PmpmlRoute } from '../types';

// ─── Platform Users ──────────────────────────────────────────────────────────
export const DEMO_USERS: User[] = [
  {
    id: 'u1', name: 'Rahul Sharma', email: 'customer@vahak.in',
    password: 'customer123', role: 'customer', phone: '9876543210', avatar: 'RS',
  },
  {
    id: 'u2', name: 'Ajay Patil', email: 'conductor@vahak.in',
    password: 'conductor123', role: 'conductor', phone: '9876543211', avatar: 'AP',
  },
  {
    id: 'u3', name: 'Priya Desai', email: 'receiver@vahak.in',
    password: 'receiver123', role: 'receiver', phone: '9876543212', avatar: 'PD',
  },
  {
    id: 'u4', name: 'Admin Kulkarni', email: 'admin@vahak.in',
    password: 'admin123', role: 'admin', phone: '9876543213', avatar: 'AK',
  },
];

// ─── PMPML Pune Stops (illustrative data) ────────────────────────────
// Coordinates are real Pune geo-locations; routes are illustrative and not official.
export const PMPML_STOPS: PmpmlStop[] = [
  { id: 's1',  name: 'Swargate Bus Terminal',    coords: [18.5018, 73.8674], type: 'major' },
  { id: 's2',  name: 'Katraj',                   coords: [18.4604, 73.8672], type: 'major' },
  { id: 's3',  name: 'Padmavati',                coords: [18.4745, 73.8611], type: 'minor' },
  { id: 's4',  name: 'Pune Railway Station',     coords: [18.5295, 73.8741], type: 'major' },
  { id: 's5',  name: 'Shivajinagar',             coords: [18.5314, 73.8446], type: 'major' },
  { id: 's6',  name: 'Deccan Gymkhana',          coords: [18.5195, 73.8382], type: 'major' },
  { id: 's7',  name: 'Hadapsar',                 coords: [18.5018, 73.9252], type: 'major' },
  { id: 's8',  name: 'Nigdi',                    coords: [18.6487, 73.7694], type: 'major' },
  { id: 's9',  name: 'Pimpri',                   coords: [18.6298, 73.7997], type: 'major' },
  { id: 's10', name: 'Chinchwad',                coords: [18.6131, 73.8104], type: 'major' },
  { id: 's11', name: 'Hinjawadi',                coords: [18.5908, 73.7080], type: 'major' },
  { id: 's12', name: 'Kothrud Depot',            coords: [18.5074, 73.8077], type: 'depot' },
  { id: 's13', name: 'Warje',                    coords: [18.4870, 73.8003], type: 'minor' },
  { id: 's14', name: 'Vishrantwadi',             coords: [18.5759, 73.9014], type: 'minor' },
  { id: 's15', name: 'Wakad',                    coords: [18.5991, 73.7631], type: 'minor' },
  { id: 's16', name: 'Baner',                    coords: [18.5590, 73.7868], type: 'minor' },
  { id: 's17', name: 'Aundh',                    coords: [18.5590, 73.8077], type: 'minor' },
  { id: 's18', name: 'Kharadi',                  coords: [18.5537, 73.9479], type: 'minor' },
];

export const STOP_BY_ID = Object.fromEntries(PMPML_STOPS.map((s) => [s.id, s]));
export const STOP_BY_NAME = Object.fromEntries(PMPML_STOPS.map((s) => [s.name, s]));

// ─── PMPML Routes (illustrative, NOT official PMPML schedules) ───────
export const PMPML_ROUTES: PmpmlRoute[] = [
  {
    id: 'r1', name: 'Route A: Katraj – Swargate – Shivajinagar',
    stopIds: ['s2', 's3', 's1', 's6', 's5'],
    color: '#3b82f6', note: 'Illustrative route',
  },
  {
    id: 'r2', name: 'Route B: Swargate – Pune Station – Vishrantwadi',
    stopIds: ['s1', 's4', 's14'],
    color: '#10b981', note: 'Illustrative route',
  },
  {
    id: 'r3', name: 'Route C: Shivajinagar – Aundh – Baner – Hinjawadi',
    stopIds: ['s5', 's17', 's16', 's15', 's11'],
    color: '#f59e0b', note: 'Illustrative route',
  },
  {
    id: 'r4', name: 'Route D: Hadapsar – Pune Station – Shivajinagar – Pimpri',
    stopIds: ['s7', 's4', 's5', 's10', 's9'],
    color: '#8b5cf6', note: 'Illustrative route',
  },
  {
    id: 'r5', name: 'Route E: Kothrud – Deccan – Swargate – Hadapsar',
    stopIds: ['s12', 's6', 's1', 's7'],
    color: '#ec4899', note: 'Illustrative route',
  },
];

// Derive legacy PUNE_ROUTES shape for PuneMap compatibility
export const PUNE_ROUTES = PMPML_ROUTES.map((r) => ({
  id: r.id,
  name: r.name,
  from: STOP_BY_ID[r.stopIds[0]]?.name || '',
  to: STOP_BY_ID[r.stopIds[r.stopIds.length - 1]]?.name || '',
  waypoints: r.stopIds.map((sid) => STOP_BY_ID[sid]?.coords || ([0, 0] as [number, number])),
  color: r.color,
}));

export const PUNE_MARKERS = PMPML_STOPS.map((s) => ({
  id: s.id, name: s.name, coords: s.coords,
  type: s.type === 'major' ? 'hub' : s.type === 'depot' ? 'depot' : 'stop',
}));

// ─── PMPML Buses (Pune city buses, illustrative) ────────────────────
export const DEMO_BUSES: Bus[] = [
  { id: 'b1', number: 'PMPML-101', route: 'Route A', conductorId: 'u2', status: 'active', currentLocation: 'Swargate Bus Terminal' },
  { id: 'b2', number: 'PMPML-204', route: 'Route B', status: 'active', currentLocation: 'Pune Railway Station' },
  { id: 'b3', number: 'PMPML-317', route: 'Route C', status: 'active', currentLocation: 'Shivajinagar' },
  { id: 'b4', number: 'PMPML-422', route: 'Route D', status: 'inactive', currentLocation: 'Kothrud Depot' },
  { id: 'b5', number: 'PMPML-509', route: 'Route E', status: 'maintenance', currentLocation: 'Kothrud Depot' },
];

// ─── Pickup/Destination lists for BookingForm ─────────────────────────────
export const PMPML_STOP_NAMES = PMPML_STOPS.map((s) => s.name);

// ─── Sample Parcels (Pune-specific, with OTPs) ────────────────────────────
// OTPs are included here because these are pre-seeded sample parcels.
// In a real system, OTPs are never stored in plain text on the client.
export const SAMPLE_PARCELS: Parcel[] = [
  {
    id: 'p1',
    trackingNumber: 'VHK-PUNE-001',
    senderId: 'u1',
    senderName: 'Rahul Sharma',
    senderPhone: '9876543210',
    receiverId: 'u3',
    receiverName: 'Priya Desai',
    receiverPhone: '9876543212',
    receiverEmail: 'receiver@vahak.in',
    pickupLocation: 'Swargate Bus Terminal',
    destination: 'Hadapsar',
    intermediateStops: ['Pune Railway Station', 'Kharadi'],
    parcelType: 'electronics',
    weight: 2.5,
    description: 'Laptop and accessories',
    status: 'in_transit',
    assignedBus: 'PMPML-101',
    conductorId: 'u2',
    conductorName: 'Ajay Patil',
    timeline: [
      { status: 'booked',    timestamp: '2024-07-10T09:00:00', location: 'Swargate Bus Terminal', description: 'Booking confirmed via VAHAK platform' },
      { status: 'assigned',  timestamp: '2024-07-10T10:00:00', location: 'Swargate Bus Terminal', description: 'Assigned to bus PMPML-101, conductor Ajay Patil' },
      { status: 'picked_up', timestamp: '2024-07-10T11:30:00', location: 'Swargate Bus Terminal', description: 'Parcel picked up by conductor' },
      { status: 'in_transit',timestamp: '2024-07-10T13:00:00', location: 'Pune Railway Station',  description: 'Bus en route via Railway Station' },
    ],
    createdAt: '2024-07-10T09:00:00',
    estimatedDelivery: '2024-07-10T18:00:00',
    amount: 235,
    deliveryOtp: '482931',
    otpAttempts: 0,
    isConfirmedByReceiver: false,
  },
  {
    id: 'p2',
    trackingNumber: 'VHK-PUNE-002',
    senderId: 'u1',
    senderName: 'Rahul Sharma',
    senderPhone: '9876543210',
    receiverName: 'Suresh Kulkarni',
    receiverPhone: '9823456789',
    pickupLocation: 'Shivajinagar',
    destination: 'Nigdi',
    intermediateStops: ['Aundh', 'Wakad'],
    parcelType: 'documents',
    weight: 0.5,
    description: 'Legal documents',
    status: 'delivered',
    assignedBus: 'PMPML-317',
    conductorName: 'Vijay More',
    timeline: [
      { status: 'booked',    timestamp: '2024-07-08T08:00:00', location: 'Shivajinagar', description: 'Booking confirmed' },
      { status: 'assigned',  timestamp: '2024-07-08T09:00:00', location: 'Shivajinagar', description: 'Assigned to bus PMPML-317' },
      { status: 'picked_up', timestamp: '2024-07-08T10:00:00', location: 'Shivajinagar', description: 'Parcel picked up' },
      { status: 'in_transit',timestamp: '2024-07-08T11:30:00', location: 'Aundh',        description: 'En route via Aundh, Wakad' },
      { status: 'arrived',   timestamp: '2024-07-08T14:00:00', location: 'Nigdi',         description: 'Arrived at destination stop' },
      { status: 'delivered', timestamp: '2024-07-08T15:00:00', location: 'Nigdi',         description: 'OTP verified – delivered to receiver' },
    ],
    createdAt: '2024-07-08T08:00:00',
    estimatedDelivery: '2024-07-08T17:00:00',
    amount: 110,
    deliveryOtp: '719204',
    otpAttempts: 0,
    otpVerifiedAt: '2024-07-08T15:00:00',
    isConfirmedByReceiver: true,
  },
  {
    id: 'p3',
    trackingNumber: 'VHK-PUNE-003',
    senderId: 'u1',
    senderName: 'Rahul Sharma',
    senderPhone: '9876543210',
    receiverId: 'u3',
    receiverName: 'Priya Desai',
    receiverPhone: '9876543212',
    receiverEmail: 'receiver@vahak.in',
    pickupLocation: 'Katraj',
    destination: 'Hinjawadi',
    intermediateStops: ['Swargate Bus Terminal', 'Deccan Gymkhana', 'Shivajinagar'],
    parcelType: 'fragile',
    weight: 3.0,
    description: 'Ceramic show-pieces',
    status: 'booked',
    timeline: [
      { status: 'booked', timestamp: '2024-07-11T10:00:00', location: 'Katraj', description: 'Booking confirmed, awaiting bus assignment' },
    ],
    createdAt: '2024-07-11T10:00:00',
    estimatedDelivery: '2024-07-11T20:00:00',
    amount: 295,
    deliveryOtp: '365812',
    otpAttempts: 0,
    isConfirmedByReceiver: false,
  },
  {
    id: 'p4',
    trackingNumber: 'VHK-PUNE-004',
    senderId: 'u1',
    senderName: 'Rahul Sharma',
    senderPhone: '9876543210',
    receiverId: 'u3',
    receiverName: 'Priya Desai',
    receiverPhone: '9876543212',
    receiverEmail: 'receiver@vahak.in',
    pickupLocation: 'Hadapsar',
    destination: 'Pimpri',
    intermediateStops: ['Pune Railway Station', 'Shivajinagar', 'Chinchwad'],
    parcelType: 'clothing',
    weight: 5.0,
    description: 'Wedding attire — handle with care',
    status: 'arrived',
    assignedBus: 'PMPML-204',
    conductorId: 'u2',
    conductorName: 'Ajay Patil',
    timeline: [
      { status: 'booked',    timestamp: '2024-07-09T07:00:00', location: 'Hadapsar',              description: 'Booking confirmed' },
      { status: 'assigned',  timestamp: '2024-07-09T08:00:00', location: 'Hadapsar',              description: 'Assigned to bus PMPML-204, conductor Ajay Patil' },
      { status: 'picked_up', timestamp: '2024-07-09T09:00:00', location: 'Hadapsar',              description: 'Parcel picked up by conductor' },
      { status: 'in_transit',timestamp: '2024-07-09T10:00:00', location: 'Pune Railway Station', description: 'Bus en route via Shivajinagar, Chinchwad' },
      { status: 'arrived',   timestamp: '2024-07-09T14:00:00', location: 'Pimpri',               description: 'Arrived at destination – awaiting OTP from receiver' },
    ],
    createdAt: '2024-07-09T07:00:00',
    estimatedDelivery: '2024-07-09T18:00:00',
    amount: 480,
    deliveryOtp: '904756',
    otpAttempts: 0,
    isConfirmedByReceiver: false,
  },
];

// ─── Sample Notifications ─────────────────────────────────────────────────
export const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', userId: 'u1', title: 'Booking Confirmed',
    message: 'Parcel VHK-PUNE-001 booked – Swargate → Hadapsar via PMPML. Your delivery OTP is ready.',
    type: 'success', isRead: false, createdAt: '2024-07-10T09:00:00',
  },
  {
    id: 'n2', userId: 'u1', title: 'Parcel In Transit',
    message: 'VHK-PUNE-001 is en route. Bus PMPML-101 currently at Pune Railway Station.',
    type: 'info', isRead: true, createdAt: '2024-07-10T13:00:00',
  },
  {
    id: 'n3', userId: 'u2', title: 'New Assignment',
    message: 'Parcel VHK-PUNE-001 assigned to you. Bus: PMPML-101. Route: Swargate → Hadapsar.',
    type: 'info', isRead: false, createdAt: '2024-07-10T10:00:00',
  },
  {
    id: 'n4', userId: 'u3', title: 'Parcel Arrived – OTP Required',
    message: 'VHK-PUNE-004 has arrived at Pimpri. Please provide your OTP to complete delivery.',
    type: 'success', isRead: false, createdAt: '2024-07-09T14:00:00',
  },
  {
    id: 'n5', userId: 'u4', title: 'New Booking – Assignment Needed',
    message: 'Parcel VHK-PUNE-003 (Katraj → Hinjawadi) needs a bus and conductor assignment.',
    type: 'warning', isRead: false, createdAt: '2024-07-11T10:00:00',
  },
];
