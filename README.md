# S.A.F.A.R. — Smart AI Framework for Assured & Responsible Tourism

**Smart India Hackathon 2026**  
**Problem Statement ID:** 26204  
**Title:** *“Student Innovation - A solution/idea that can boost the current situation of the tourism industries including hotels, travel and others.”*  
**Theme:** Travel & Tourism • **Category:** Software • **Organization:** AICTE  

---

## 🌟 Vision & Platform Overview

**S.A.F.A.R.** is a unified, tourism-first digital enablement platform engineered to invigorate local tourism economies, boost hospitality and hotel occupancy, streamline transparent travel mobility, and protect travelers across India.

The platform is structured around the seamless traveler lifecycle:

$$\mathbf{DISCOVER} \longrightarrow \mathbf{PLAN} \longrightarrow \mathbf{COMPARE} \longrightarrow \mathbf{CONNECT} \longrightarrow \mathbf{TRAVEL} \longrightarrow \mathbf{STAY\ SAFE}$$

Rather than functioning as an emergency surveillance tool, S.A.F.A.R. leads with discovery, AI itinerary planning, fair-fare mobility, and curated stays—while embedding a robust, 24x7 **Travel Safety & Trust Layer** as an invisible, reassuring safety net throughout the traveler's journey.

---

## 🧭 Core Functional Modules

### 1. Discover Indian Circuits (`/explore`)
- Searchable and filterable directory of major Indian tourism corridors:
  - **Ayodhya Dham & Ram Janmabhoomi Corridor** (Uttar Pradesh)
  - **Katra Vaishno Devi & Jammu Pilgrim Track** (Jammu & Kashmir)
  - **Agra World Heritage Corridor & Taj Mahal** (Uttar Pradesh)
  - **Kashi Vishwanath & Ganga Ghats** (Varanasi, Uttar Pradesh)
  - **Shillong & Cherrapunji Monsoon Corridor** (Meghalaya)
  - **Jaipur Pink City & Aravalli Forts** (Rajasthan)
- Provides key highlights, best seasons, ideal duration, moderate daily budgets, and verified safe boundary corridors.

### 2. Smart AI Trip Planner (`/trip-planner`)
- **Deterministic AI Travel Intelligence Service:** 100% offline and deterministic fallback with zero paid API dependencies.
- Generates personalized day-by-day itineraries tailored to traveler count, duration (1–7 days), budget tier (Budget, Moderate, Luxury), and transport preference.
- Produces itemized budget estimations (accommodation, transport, entry fees & local dining).
- Maps interactive waypoints with route polylines and cultural insights.
- 1-Click **"Save Itinerary to My Trip"** synchronization (`POST /api/trips`).

### 3. Multi-Provider Fare Comparison (`/fares`)
- Side-by-side benchmark fare comparisons across **Uber**, **Ola**, and **Rapido**.
- **Transparent Prototype Estimation:** Every ride option is clearly marked with an `🏷️ ESTIMATED FARE` badge and calibrated formula breakdown.
- Deep-link handoff directly opens official provider apps/portals with pre-filled destination coordinates.
- **Anti-Scam Meter Estimator:** Live tariff calculator based on local city transport regulations for autos, taxis, and night surcharges to prevent transit extortion.

### 4. Curated Hotels & Pilgrim Stays (`/hotels`)
- Curated directory of authentic local accommodations: pilgrim yatri niwas, ashram guest houses, and eco-homestays.
- Search and filter by circuit, accommodation type, and maximum price.
- **Prototype Registry Notice:** Stay tariffs reflect realistic calibrated benchmark pricing for trip planning and hackathon demonstration; no live payment transactions are processed.
- SHA-256 digital record verification modal for authentic stays.

### 5. Verified Local Guides & Artisan Marketplace (`/vendor-marketplace` & `/guide-dashboard`)
- **Prototype Trust Ledger:** SHA-256 ledger records authenticate certified local tour guides and authentic artisan stalls.
- QR hash validation verifies operator credentials and review history, eliminating unauthorized touts.
- Dedicated **Guide Cockpit** (`/guide-dashboard`) allows certified local guides to verify digital credentials and manage assigned tourists.

### 6. My Trip & Tourist Hub (`/tourist-dashboard`)
- **Tourism-First Hierarchy:** Above the fold, travelers immediately see their active destination, day-by-day itinerary timeline, recommended stays, daily budget tracker, and assigned guide details.
- Seamless circuit switcher with live location sensor simulation (`Live Walk`, `GPS`, `Mesh`).

### 7. Integrated Travel Safety & Trust Layer
- **1-Click Emergency SOS (`/sos`):** Instant panic packet dispatch with live GPS coordinates, automated police CAD patrol response ETA calculation, and nearby hospital/police mapping.
- **Dynamic Geo-Fencing Sentinel:** Real-time polygon containment engine with proactive 300m and 150m pre-entry hazard proximity warnings before restricted zones.
- **Automated Deadman's Switch (`/deadman-switch`):** Configurable safety countdowns for solo or night travelers; automatically prompts for check-ins and triggers emergency escalation if inactive.
- **0-Signal Ghost-Mesh Protocol:** Multi-hop peer-to-peer Bluetooth LE relay simulator enabling offline distress packets in zero-cellular remote valleys.
- **Holographic Digital ID (`/digital-id`):** Cryptographically signed tourist credentials with QR verification for rapid checkpoint clearance.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Leaflet (OpenStreetMap), Recharts, Lucide React, QRCode.react.
- **Backend:** Node.js, Express.js, JWT Authentication, Bcryptjs password hashing, Native Crypto SHA-256.
- **Data Persistence:** Dual-mode architecture:
  - Connects to MongoDB (`mongodb://127.0.0.1:27017/safar_db`) when available.
  - Automatically falls back to a high-speed, zero-dependency in-memory JSON state store with pre-seeded pan-India demo circuits.

---

## 📁 Repository Structure

```text
SAFAR/
├── backend/
│   ├── config/              # In-memory store & MongoDB connector (db.js)
│   ├── controllers/         # AI, Fares, Trips, Incidents, Auth, Blockchain, Analytics
│   ├── middleware/          # JWT & Role authorization
│   ├── routes/              # Express API Routes (/api/ai, /api/fares, /api/trips, /api/sos...)
│   ├── services/            # AI Travel Service, Fare Compare Service, Risk Engine
│   ├── utils/               # Geofence Polygon Ray-casting, Haversine Math, Seed Dataset
│   ├── .env.example         # Environment template
│   ├── package.json
│   └── server.js            # Express server entry point
│
├── frontend/
│   ├── public/              # Static assets & manifest
│   ├── src/
│   │   ├── components/      # Navbar, BottomDock, MapView, RideCompareCard, SOSButtonModal, DeadmanSwitch
│   │   ├── pages/           # LandingPage, ExploreDestinationsPage, TripPlannerPage, HotelsPage,
│   │   │                    # FaresPage, TouristDashboard, GuideDashboard, AuthorityDashboard, AnalyticsPage
│   │   ├── App.jsx          # Route definitions & global state orchestration
│   │   ├── index.css        # Tailwind & Glassmorphism design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:3000` (or `http://localhost:5173` depending on port availability)*

### 4. Production Build
```bash
npm --prefix frontend run build
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Persona & Focus |
| :--- | :--- | :--- | :--- |
| **Tourist** | `rohan.verma@example.com` | `tourist123` | Rohan Verma • Ayodhya Pilgrim Circuit (`TID-1035`) |
| **Authority** | `authority@safetour.gov.in` | `admin123` | National Tourism Oversight & Command Desk |
| **Certified Guide** | `vikas.guide@example.com` | `guide123` | Vikas Chandel • Katra Vaishno Devi Specialist |

---

## 🎯 SIH Evaluator 5-Minute Demonstration Script

1. **DISCOVER:** Open the landing page (`/`). View the 10-second tourism pitch and browse popular Indian circuits. Navigate to `/explore` to search and filter spiritual, heritage, and adventure corridors.
2. **PLAN:** Click **Plan Trip Here** on any destination (e.g., Ayodhya or Katra). Enter duration, travelers, and budget. Generate the AI Smart Itinerary to view morning/afternoon/evening schedules, budget breakdown, and route map. Click **Save Itinerary to My Trip**.
3. **COMPARE:** Navigate to `/fares`. Compare Uber, Ola, and Rapido benchmark estimated fares with formula calculation details and official app handoff links. Review regulated local auto/taxi tariffs.
4. **CONNECT:** Visit `/hotels` to browse curated pilgrim niwas and homestays. Visit `/vendor-marketplace` to view certified guide profiles with SHA-256 QR verification.
5. **TRAVEL & STAY SAFE:** Open `/tourist-dashboard`. Notice the active trip and itinerary displayed above the fold. Scroll to the Travel Safety & Trust Layer:
   - Trigger the **1-Click Panic SOS** (`/sos`) to see instant CAD patrol dispatch ETA.
   - Run any of the **8 Evaluator Scenarios** on the Landing Page to test 300m/150m pre-entry hazard buffers, route deviations, and blockchain audits.

---

## ⚖️ Disclaimer & Prototype Data Governance

- **Estimated Fares:** Fares shown for ride-hailing services are calibrated benchmark estimates computed using distance, duration, and regional transit baselines. Deep links redirect users to official provider applications (Uber, Ola, Rapido) where live booking and payment take place.
- **Curated Accommodations:** Accommodations listed are curated prototype representations of regional pilgrim niwas and homestays with realistic seasonal benchmark pricing.
- **Prototype Trust Ledger:** Blockchain verification features utilize standard SHA-256 cryptographic hashing to demonstrate tamper-evident audit logging for hackathon evaluation.
- **No Official Validation Claimed:** S.A.F.A.R. is an academic hackathon innovation prototype and does not claim official government endorsement or live government database integration.

---

## 📄 Hackathon Attribution & License

Developed for the **Smart India Hackathon (SIH 2026)**  
**Problem Statement ID:** 26204 • **Category:** Software • **Organization:** AICTE  
© 2026 S.A.F.A.R. Team. Released under the MIT License.
