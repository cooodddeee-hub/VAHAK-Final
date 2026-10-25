# 🚌 VAHAK — PMPML Pune Parcel Demo

A complete, presentation-ready demo application exploring parcel delivery coordination
via Pune's PMPML city bus network. Built with **React + TypeScript + Vite + React-Leaflet**.

> ⚠️ **Academic/Demo project.** Not an official PMPML service. PMPML does not currently
> offer a commercial parcel delivery programme. Routes and buses shown are illustrative only.

---

## ✨ What's New (PMPML Update)

| Feature | Details |
|---|---|
| **Pune PMPML Focus** | All buses, routes, and stops are Pune city–specific. Maharashtra-wide data removed. |
| **Multi-Stop Route Picker** | Add, remove, and reorder intermediate PMPML stops in the booking form. |
| **Live Route Map** | Map updates dynamically as you select stops. Straight-line visualisation (no road routing). |
| **6-Digit OTP Delivery** | Generated once at booking. Required by receiver to confirm handover. |
| **OTP Attempt Limit** | 5 wrong attempts locks the parcel. Admin/sender must intervene. |
| **Conductor Cannot Bypass OTP** | Status can go up to "Arrived". Final "Delivered" requires receiver OTP. |
| **OTP Never on Receipts** | Receipts show "OTP Verified ✓" but never the code itself. |
| **Schema Version v2** | localStorage keys bumped to `vahak_v2_*` — clean slate from old v1 data. |
| **Pune Sample Data** | 4 Pune-specific demo parcels with pre-seeded OTPs. |

---

## 🔑 Demo Login Credentials

| Role | Email | Password | What you can do |
|---|---|---|---|
| **Customer** | `customer@vahak.in` | `customer123` | Book parcels, view OTP, track shipments |
| **Conductor** | `conductor@vahak.in` | `conductor123` | Progress shipment status (up to Arrived) |
| **Receiver** | `receiver@vahak.in` | `receiver123` | Enter OTP to confirm delivery |
| **Admin** | `admin@vahak.in` | `admin123` | Assign buses & conductors, view all data |

---

## 🔐 OTP Workflow (End-to-End)

```
Customer books parcel → OTP generated & shown on confirmation screen
         ↓
Admin assigns PMPML bus + conductor
         ↓
Conductor: Picked Up → In Transit → Arrived at Destination
         ↓
Receiver enters 6-digit OTP in their dashboard
         ↓
✅ OTP matches → Delivered | ❌ Wrong → Error (max 5 attempts)
```

**Demo OTPs for pre-loaded parcels:**

| Tracking | OTP | Status |
|---|---|---|
| VHK-PUNE-001 | `482931` | In Transit (conductor assigned) |
| VHK-PUNE-003 | `365812` | Booked (needs admin assignment) |
| VHK-PUNE-004 | `904756` | **Arrived — try receiver OTP now!** |

> Login as **Receiver** (`receiver@vahak.in`) and enter `904756` for parcel VHK-PUNE-004
> to see the full OTP delivery confirmation flow.

---

## 🖥️ Setup — Windows PowerShell (Beginner Friendly)

### Prerequisites

Install **Node.js 18+** from [nodejs.org](https://nodejs.org). Verify:
```powershell
node -v    # should show v18.x or higher
npm -v
```

### Run the app

```powershell
# 1. Navigate to the project folder
cd "C:\path\to\VAHAK-Final"

# 2. Install dependencies (only needed once)
npm install

# 3. Start development server
npm run dev
```

The app opens at **http://localhost:5173** automatically.

### Other commands

```powershell
npm run build    # Production build → output in /dist
npm run preview  # Preview the production build locally
```

---

## 📁 Project Structure

```
VAHAK-Final/
├── src/
│   ├── components/
│   │   ├── dashboards/
│   │   │   ├── CustomerDashboard.tsx   # OTP reminder, route map
│   │   │   ├── ConductorDashboard.tsx  # Status progression (no bypass)
│   │   │   ├── ReceiverDashboard.tsx   # OTP entry & verification
│   │   │   └── AdminDashboard.tsx      # Bus/conductor assignment
│   │   ├── maps/
│   │   │   ├── PuneMap.tsx             # Dynamic Leaflet map, fitBounds
│   │   │   └── StopRoutePicker.tsx     # Multi-stop selector with reorder
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx         # Updated with new statuses
│   │   │   ├── ShipmentTimeline.tsx    # Updated status sequence
│   │   │   └── DeliveryReceipt.tsx     # OTP Verified badge, never shows OTP
│   │   ├── BookingForm.tsx             # 3-step + OTP generation on confirm
│   │   ├── LandingPage.tsx             # PMPML Pune branding
│   │   ├── LoadingScreen.tsx
│   │   ├── LoginModal.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── context/
│   │   └── AppContext.tsx              # verifyOtpAndDeliver(), schema v2
│   ├── data/
│   │   └── sampleData.ts              # PMPML stops, routes, Pune buses, sample parcels
│   ├── types/
│   │   └── index.ts                   # Updated ParcelStatus, PmpmlStop, PmpmlRoute
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚠️ Important Disclaimers

| Topic | Explanation |
|---|---|
| **PMPML** | This is an academic concept demo. Not affiliated with or endorsed by PMPML or Maharashtra government. |
| **Routes** | All routes and stops are illustrative. Not official PMPML schedules or verified connections. |
| **localStorage** | All data (parcels, OTPs, status) lives in your browser. Clearing browser data resets the app. |
| **OTP Security** | Demo only — OTP is stored in plain text in localStorage. Never do this in production. |
| **Map Routing** | Straight-line polylines between stops. Not road-following. OSRM/OSRM routing is CORS-restricted from browsers without a proxy. |
| **No SMS** | The app never sends a real SMS or notification. Share the OTP manually (the demo shows it on the booking screen). |
| **Schema v2** | If you used the previous version, the app uses new localStorage keys (`vahak_v2_*`) to avoid conflicts with old data. |

---

## 🚀 Recommended Demo Workflow

1. **Admin** → assign bus `PMPML-101` + conductor `Ajay Patil` to parcel `VHK-PUNE-003`
2. **Conductor** → select `VHK-PUNE-001` → click "Mark Picked Up" → "Mark In Transit" → "Arrived"
3. **Customer** → see OTP reminder banner for `VHK-PUNE-004` (OTP: `904756`)
4. **Receiver** → select `VHK-PUNE-004` → enter OTP `904756` → confirm delivery
5. **Customer** → watch status update to "Delivered & OTP Verified ✓"
6. **Customer** → book a NEW parcel with multi-stop route → copy the generated OTP
7. **Receiver** → try the wrong OTP → see error counter → enter correct OTP → success

---

*Built for academic demonstration. Tech stack: React 18 · TypeScript · Vite · Tailwind CSS · React-Leaflet · Lucide Icons*
